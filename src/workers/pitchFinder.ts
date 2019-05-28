/**
 * Adapted from https://github.com/peterkhayes/pitchfinder into Typescript class
 */

/**
 * Defines the relative size the chosen peak (pitch) has. 0.93 means: choose
 * the first peak that is higher than 93% of the highest peak detected. 93%
 * is the default value used in the Tartini user interface.
 */
const DEFAULT_CUTOFF = 0.97;

const DEFAULT_SAMPLE_RATE = 44100;

/**
 * For performance reasons, peaks below this cutoff are not even considered.
 */
const SMALL_CUTOFF = 0.5;

/**
 * Pitch annotations below this threshold are considered invalid, they are
 * ignored.
 */
const LOWER_PITCH_CUTOFF = 80;

export type PitchData = { freq: number, probability: number};

export class PitchFinder {
    /**
     * Defines the relative size the chosen peak (pitch) has.
     */
    public cutoff: number;

    /**
     * The audio sample rate. Most audio has a sample rate of 44.1kHz.
     */
    public sampleRate: number;

    /**
     * Contains a normalized square difference function value for each delay
     * (tau).
     */
    public nsdf!: Float32Array;

    /**
     * Contains a sum of squares of the Buffer, for improving performance
     * (avoids redoing math in the normalized square difference function)
     */
    public squareSums!: Float32Array;

    constructor(config: {[key: string]: any} = {}) {
        this.cutoff = config.cutoff || DEFAULT_CUTOFF;
        this.sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;
    }

    /**
     * Implements the normalized square difference function. See section 4 (and
     * the explanation before) in the MPM article. This calculation can be
     * optimized by using an FFT. The results should remain the same.
     */
    private normalizedSquareDifference(float32AudioBuffer: Float32Array) {
        let acf = 0;
        this.squareSums[0] = float32AudioBuffer[0] * float32AudioBuffer[0];
        for (let x = 1; x < float32AudioBuffer.length; x += 1) {
            this.squareSums[x] = (float32AudioBuffer[x] * float32AudioBuffer[x]) + this.squareSums[x - 1];
        }
        for (let tau = 0; tau < float32AudioBuffer.length; tau += 1) {
            acf = 0;
            const divisorM = this.squareSums[float32AudioBuffer.length - 1 - tau]
                + this.squareSums[float32AudioBuffer.length - 1]
                - this.squareSums[tau];
            for (let i = 0; i < float32AudioBuffer.length - tau; i += 1) {
                acf += float32AudioBuffer[i] * float32AudioBuffer[i + tau];
            }
            this.nsdf[tau] = 2 * acf / divisorM;
        }
    }

    /**
     * Finds the x value corresponding with the peak of a parabola.
     * Interpolates between three consecutive points centered on tau.
     */
    private parabolicInterpolation(freqs: Float32Array, tau: number): { x: number, y: number } {
        const nsdfa = freqs[tau - 1];
        const nsdfb = freqs[tau];
        const nsdfc = freqs[tau + 1];
        const bValue = tau;
        const bottom = nsdfc + nsdfa - 2 * nsdfb;
        if (bottom === 0) {
            return {
                x: bValue,
                y: nsdfb,
            };
        }
        const delta = nsdfa - nsdfc;
        return {
            x: bValue + delta / (2 * bottom),
            y: nsdfb - delta * delta / (8 * bottom),
        };
    }

    // Finds the highest value between each pair of positive zero crossings.
    private peakPicking(freqs: Float32Array): number[] {
        let pos = 0;
        let curMaxPos = 0;
        const out: number[] = [];

        // find the first negative zero crossing.
        while (pos < (freqs.length - 1) / 3 && freqs[pos] > 0) {
            pos += 1;
        }

        // loop over all the values below zero.
        while (pos < freqs.length - 1 && freqs[pos] <= 0) {
            pos += 1;
        }

        // can happen if output[0] is NAN
        if (pos === 0) {
            pos = 1;
        }

        while (pos < freqs.length - 1) {
            if (freqs[pos] > freqs[pos - 1] && freqs[pos] >= freqs[pos + 1]) {
                if (curMaxPos === 0) {
                    // the first max (between zero crossings)
                    curMaxPos = pos;
                } else if (freqs[pos] > freqs[curMaxPos]) {
                    // a higher max (between the zero crossings)
                    curMaxPos = pos;
                }
            }
            pos += 1;
            // a negative zero crossing
            if (pos < freqs.length - 1 && freqs[pos] <= 0) {
                // if there was a maximum add it to the list of maxima
                if (curMaxPos > 0) {
                    out.push(curMaxPos);
                    curMaxPos = 0; // clear the maximum position, so we start
                    // looking for a new ones
                }
                while (pos < freqs.length - 1 && freqs[pos] <= 0) {
                    pos += 1; // loop over all the values below zero
                }
            }
        }
        if (curMaxPos > 0) {
            out.push(curMaxPos);
        }

        return out;
    }

    public findPitch(float32AudioBuffer: Float32Array): PitchData {
        if (!this.nsdf || this.nsdf.length !== float32AudioBuffer.length) {
            this.nsdf = new Float32Array(float32AudioBuffer.length);
            this.squareSums = new Float32Array(float32AudioBuffer.length);
        }

        let pitch = -1;
        const periodEstimates: number[] = [];
        const ampEstimates = [];

        // 1. Calculate the normalized square difference for each Tau value.
        this.normalizedSquareDifference(float32AudioBuffer);
        // 2. Peak picking time: time to pick some peaks.
        const maxPositions = this.peakPicking(this.nsdf);

        let highestAmplitude = -Infinity;

        for (let i = 0; i < maxPositions.length; i += 1) {
            const tau = maxPositions[i];
            // make sure every annotation has a probability attached
            highestAmplitude = Math.max(highestAmplitude, this.nsdf[tau]);

            if (this.nsdf[tau] > SMALL_CUTOFF) {
                // calculates turningPointX and Y
                const turningPoint = this.parabolicInterpolation(this.nsdf, tau);
                // store the turning points
                ampEstimates.push(turningPoint.y);
                periodEstimates.push(turningPoint.x);
                // remember the highest amplitude
                highestAmplitude = Math.max(highestAmplitude, turningPoint.y);
            }
        }

        if (periodEstimates.length) {
            // use the overall maximum to calculate a cutoff.
            // The cutoff value is based on the highest value and a relative
            // threshold.
            const actualCutoff = this.cutoff * highestAmplitude;

            for (let i = 0; i < ampEstimates.length; i += 1) {
                if (ampEstimates[i] >= actualCutoff) {
                    const period = periodEstimates[i];
                    const pitchEstimate = this.sampleRate / period;

                    if (pitchEstimate > LOWER_PITCH_CUTOFF) {
                        pitch = pitchEstimate;
                        break;
                    }
                }
            }
        }

        return {
            probability: pitch !== -1 ? highestAmplitude : 0,
            freq: pitch,
        };
    }
}
