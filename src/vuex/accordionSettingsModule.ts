import {
  createModule, mutation, getter,
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
    ...accordions,
    ...module.customLayouts,
  ];
}

export class AccordionSettingsModule extends VuexModule {
  @getter customLayouts: AccordionDefinition[] = [];

  private currentAccordionLayout: AccordionDefinition = accordions[0];

  viewStyle: ViewStyle = 'both';

  showEditControls: boolean = false;

  public mirrorView: boolean = false;

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

  @mutation saveLayout() {
    const copyIndex = this.customLayouts.findIndex((i) => i.id === this.currentAccordionLayout.id);
    if (copyIndex > -1) {
      this.currentAccordionLayout.edited = false;
      this.customLayouts.splice(copyIndex, 1, this.currentAccordionLayout);
    }
  }

  @mutation resetLayout() {
    const source = accordionLayouts(this).find((i) => i.id === this.currentAccordionLayout.id);
    if (source) {
      this.currentAccordionLayout = _.cloneDeep(source);
    }
  }

  @mutation makeCopy(layout: AccordionDefinition, skipNameChange = false) {
    const copy = _.cloneDeep(layout);
    copy.name = skipNameChange ? copy.name : `${copy.name} (Copy)`;
    copy.id = generateUUID();
    copy.custom = true;
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
