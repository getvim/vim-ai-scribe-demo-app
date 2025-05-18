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
): SectionFields<T> => {
  const section = details[sectionName] || {};
  const updatableFields = priorityList.filter(
    (fieldName) => section[fieldName as keyof typeof section] === true
  );

  return updatableFields;
};

export const useUpdateEncounterSubscription = <
  T extends keyof EHR.UpdateEncounterParams
>(
  sectionName: T,
  subscriptionParams: EHR.CanUpdateEncounterParams[T],
  priorityList: SectionFields<T>
) => {
  const vimOS = useVimOsContext();
  const [canUpdateSubscriptionParams, setCanUpdateSubscriptionParams] =
    useState<boolean>(false);
  const [subscriptionUpdatableFields, setSubscriptionUpdatableFields] =
    useState<SectionFields<T>>();

  useEffect(() => {
    const onUpdate = () => {
      const { details } = vimOS.ehr.resourceUpdater.canUpdateEncounter({
        [sectionName]: subscriptionParams,
      });
      const updatableFields = calcIsUpdatable(
        sectionName,
        priorityList,
        details
      );
      const canUpdate = updatableFields.length > 0;
      setCanUpdateSubscriptionParams(canUpdate);
      setSubscriptionUpdatableFields(updatableFields);
    };

    vimOS.ehr.resourceUpdater.subscribe("encounter", onUpdate);

    return () => vimOS.ehr.resourceUpdater.unsubscribe("encounter", onUpdate);
  }, [
    priorityList,
    sectionName,
    subscriptionParams,
    vimOS.ehr.resourceUpdater,
  ]);

  // Expose flag, field to update & update function
  return useMemo(
    () => ({
      canUpdateSubscriptionParams,
      subscriptionUpdatableFields,
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
              subscriptionUpdatableFields,
              description: error ? JSON.stringify(error) : "An error occurred.",
            });
          });
      },
    }),
    [
      canUpdateSubscriptionParams,
      sectionName,
      subscriptionUpdatableFields,
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
