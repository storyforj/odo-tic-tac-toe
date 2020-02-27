export type Trigger = {
  init?: () => void,
  execute?: () => void,
  remove?: () => void,
  shouldActivate: () => boolean,
  shouldRemove: () => boolean,
};

type PendingTriggersReducer = {
  moveToActive: Array<Trigger>;
  keepPassive: Array<Trigger>;
};

type ActiveTriggersReducer = {
  executeTriggers: Array<Trigger>;
  removeTriggers: Array<Trigger>;
  keepActive: Array<Trigger>;
};

export default class Sequencer {
  public activeTriggers: Array<Trigger> = [];
  public pendingTriggers: Array<Trigger> = [];

  constructor(pendingTriggers: Array<Trigger> = []) {
    this.pendingTriggers = pendingTriggers;
  }

  private processPendingTriggers() {
    const pendingTriggerReduction : PendingTriggersReducer = this.pendingTriggers.reduce((memo, trigger) => {
      if (trigger.shouldActivate()) {
        memo.moveToActive.push(trigger);
        return memo;
      }

      memo.keepPassive.push(trigger);
      return memo;
    }, {
      moveToActive: [],
      keepPassive: [],
    } as PendingTriggersReducer);

    pendingTriggerReduction.moveToActive.forEach((trigger) => {
      if (trigger.init) { trigger.init(); }
    });

    this.pendingTriggers = pendingTriggerReduction.keepPassive;
    this.activeTriggers = this.activeTriggers.concat(pendingTriggerReduction.moveToActive);
  }

  private processActiveTriggers() {
    const activeTriggersReduction : ActiveTriggersReducer = this.activeTriggers.reduce((memo, trigger) => {
      if (!trigger.shouldRemove()) {
        memo.keepActive.push(trigger);
      } else {
        memo.removeTriggers.push(trigger);
      }

      if (trigger.execute) {
        memo.executeTriggers.push(trigger);
      }

      return memo;
    }, {
      keepActive: [],
      removeTriggers: [],
      executeTriggers: [],
    } as ActiveTriggersReducer);

    activeTriggersReduction.removeTriggers.forEach((trigger) => trigger.remove && trigger.remove());
    activeTriggersReduction.executeTriggers.forEach((trigger) => trigger.execute && trigger.execute());
    this.activeTriggers = activeTriggersReduction.keepActive;
  }

  update() {
    this.processPendingTriggers();
    this.processActiveTriggers();
  }
}
