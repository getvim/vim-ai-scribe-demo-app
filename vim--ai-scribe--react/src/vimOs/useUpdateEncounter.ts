import { useEffect, useMemo, useState } from "react";
import type { EHR } from "vim-os-js-browser/types";
import { useVimOsContext } from "@/providers/VimOSContext";

type SectionField<T extends keyof EHR.UpdateEncounterParams> =
  keyof NonNullable<EHR.UpdateEncounterParams[T]>;

type SectionFields<T extends keyof EHR.UpdateEncounterParams> = Array<
  SectionField<T>
>;

const calcIsUpdatable = <T extends keyof EHR.UpdateEncounterParams>(
  sectionName: T,
  priorityList: SectionFields<T>,
  details: EHR.CanUpdateEncounterParams
): SectionField<T> | undefined => {
  if (sectionName && priorityList) {
    const section = details[sectionName];
    if (!section) {
      return undefined;
    }
    const updatableField = priorityList.find(
      (fieldName) => section[fieldName] === true
    );

    return updatableField;
  }
};

export const useUpdateEncounterSubscription = <
  T extends keyof EHR.UpdateEncounterParams
>(
  sectionName: T,
  priorityList: SectionFields<T>
) => {
  const vimOS = useVimOsContext();
  const [canUpdateSubscriptionParams, setCanUpdateSubscriptionParams] =
    useState<boolean>(false);
  const [subscriptionUpdatableField, setSubscriptionUpdatableField] =
    useState<SectionField<T>>();

  useEffect(() => {
    const onUpdate = () => {
      const { details } = vimOS.ehr.resourceUpdater.canUpdateEncounter({
        [sectionName]: priorityList.reduce(
          (acc, field) => ({
            ...acc,
            [field]: true,
          }),
          {}
        ),
      });
      const updatableField = calcIsUpdatable(
        sectionName,
        priorityList,
        details
      );
      const canUpdate = updatableField !== undefined;
      setCanUpdateSubscriptionParams(canUpdate);
      setSubscriptionUpdatableField(updatableField);
    };

    vimOS.ehr.resourceUpdater.subscribe("encounter", onUpdate);

    return () => vimOS.ehr.resourceUpdater.unsubscribe("encounter", onUpdate);
  }, [priorityList, sectionName, vimOS.ehr.resourceUpdater]);

  // Expose flag, field to update & update function
  return useMemo(
    () => ({
      canUpdateSubscriptionParams,
      subscriptionUpdatableField,
      updateSubscriptionField: (content: string) => {
        if (!sectionName || !canUpdateSubscriptionParams) {
          return;
        }

        vimOS.ehr.resourceUpdater
          .updateEncounter({
            [sectionName]: {
              [subscriptionUpdatableField as string]: content,
            },
          })
          .then(() => {
            console.log({
              variant: "default",
              title: "Encounter notes updated!",
            });
          })
          .catch((error) => {
            console.log({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              sectionName,
              subscriptionUpdatableField,
              description: error ? JSON.stringify(error) : "An error occurred.",
            });
          });
      },
    }),
    [
      canUpdateSubscriptionParams,
      sectionName,
      subscriptionUpdatableField,
      vimOS.ehr.resourceUpdater,
    ]
  );
};

export const useUpdateEncounter = () => {
  const vimOS = useVimOsContext();

  return useMemo(
    () => ({
      // Direct API call to update encounter notes
      checkCanUpdate: vimOS.ehr.resourceUpdater.canUpdateEncounter,
      updateEncounter: (payload: EHR.UpdateEncounterParams) =>
        vimOS.ehr.resourceUpdater
          .updateEncounter(payload)
          .then(() => {
            console.log({
              variant: "default",
              title: "Encounter notes updated!",
            });
          })
          .catch((error) => {
            console.log({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: error ? JSON.stringify(error) : "An error occurred.",
            });
          }),
    }),
    [vimOS.ehr.resourceUpdater]
  );
};
