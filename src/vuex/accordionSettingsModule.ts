import {
  createModule, mutation, getter, action,
} from 'vuex-class-component';
import _ from 'lodash';
import { AccordionDefinition } from '@/components/accordion/AccordionDef';
import { accordions } from '@/data/accordions';
import { generateUUID } from '@/helpers/uuid';

const VuexModule = createModule({
  strict: false,
  namespaced: 'accordion',
  enableLocalWatchers: true,
});

export type ViewStyle = 'opening' | 'closing' | 'both';

function accordionLayouts(module: AccordionSettingsModule) {
  return [
    ...module.customLayouts,
    ...accordions,
  ];
}

export class AccordionSettingsModule extends VuexModule {
  @getter customLayouts: AccordionDefinition[] = [];

  private currentAccordionLayout: AccordionDefinition = null as any;

  viewStyle: ViewStyle = 'both';

  showEditControls: boolean = false;

  public mirrorView: boolean = false;

  @action async onSetup() {
    if (!this.currentAccordionLayout) {
      [this.accordionLayout] = accordions;
    }
    this.updateLayoutsToLatest();
  }

  @mutation updateLayoutsToLatest() {
    [...this.customLayouts, this.currentAccordionLayout].forEach((l) => {
      [...l.leftHand, ...l.rightHand].forEach((r) => {
        r.buttons.forEach((b) => {
          if (typeof b.closing === 'string') {
            b.closing = { note: b.closing };
          }
          if (typeof b.opening === 'string') {
            b.opening = { note: b.opening };
          }
        });
      });
    });
  }

  get accordionLayouts() {
    return accordionLayouts(this);
  }

  get accordionLayout() {
    return this.currentAccordionLayout;
  }

  set accordionLayout(data) {
    this.currentAccordionLayout = _.cloneDeep(data);
  }

  @mutation updateLayout(update: any) {
    this.currentAccordionLayout = {
      ...this.currentAccordionLayout,
      ...update,
      id: this.currentAccordionLayout.id,
      custom: this.currentAccordionLayout.custom,
      edited: true,
    };
  }

  @mutation saveLayout(layout: AccordionDefinition) {
    const copyIndex = this.customLayouts.findIndex((i) => i.id === layout.id);
    if (copyIndex > -1) {
      layout.edited = false;
      this.customLayouts.splice(copyIndex, 1, _.cloneDeep(layout));
    }
  }

  @mutation resetLayout() {
    const source = accordionLayouts(this).find((i) => i.id === this.currentAccordionLayout!.id);
    if (source) {
      this.currentAccordionLayout = _.cloneDeep(source);
    }
  }

  @mutation makeCopy(layout: AccordionDefinition, skipNameChange = false) {
    const copy = _.cloneDeep(layout);
    copy.name = skipNameChange ? copy.name : `${copy.name} (Copy)`;
    copy.id = generateUUID();
    copy.custom = true;
    copy.edited = false;
    this.customLayouts.push(copy);
    this.currentAccordionLayout = copy;
  }

  @mutation deleteLayout(layout: AccordionDefinition) {
    const copyIndex = this.customLayouts.findIndex((i) => i.id === layout.id);
    if (copyIndex > -1) {
      this.customLayouts.splice(copyIndex, 1);
    }

    this.currentAccordionLayout = _.cloneDeep(accordionLayouts(this)[0]);
  }
}
