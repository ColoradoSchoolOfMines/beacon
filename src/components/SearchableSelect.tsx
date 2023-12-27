import {
  CheckboxCustomEvent,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  RadioGroupCustomEvent,
  SearchbarCustomEvent,
} from "@ionic/react";
import Fuse, {IFuseOptions} from "fuse.js";
import {useEffect, useRef, useState} from "react";

import {KeysOfType} from "~/lib/types";

export interface SearchableSelectProps<T extends object> {
  /**
   * Component children
   * @param open Open the selector
   * @returns JSX
   */
  children: (open: () => void) => JSX.Element;

  /**
   * Select label
   */
  label: string;

  /**
   * All items
   */
  items: T[];

  /**
   * Item unique value key
   */
  itemValueKey: KeysOfType<T, string>;

  /**
   * Item renderer
   */
  itemRenderer: (item: T) => JSX.Element;

  /**
   * Selected item(s) (If multiple is false, then this will be a single item)
   */
  selectedItems: T[];

  /**
   * Selection change handler
   * @param items New selected item(s) (If multiple is false, then this will be a single item)
   */
  setSelectedItems: (items: T[]) => void;

  /**
   * Whether or not to allow multiple items to be selected
   */
  multiple?: boolean;

  /**
   * Fuse.js search options
   */
  searchOptions: IFuseOptions<T>;
}

/**
 * Searchable select component
 * @returns JSX
 */
export const SearchableSelect = <T extends object>({
  children,
  label,
  items,
  itemValueKey,
  itemRenderer,
  selectedItems,
  setSelectedItems,
  multiple = true,
  searchOptions,
}: SearchableSelectProps<T>) => {
  // Hooks
  const modal = useRef<HTMLIonModalElement>(null);
  const searchBar = useRef<HTMLIonSearchbarElement>(null);
  const [fuse, setFuse] = useState<Fuse<T> | undefined>();
  const [query, setQuery] = useState<string>("");
  const [workingSelectedItems, setWorkingSelectedItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  // Effects
  useEffect(() => {
    // Initialize fuse
    setFuse(new Fuse(items, searchOptions));
  }, [items, searchOptions]);

  useEffect(() => {
    // Filter items
    if (fuse === undefined) {
      return;
    }

    setFilteredItems(
      query === "" ? items : fuse.search(query).map(result => result.item),
    );
  }, [fuse, query]);

  // Methods
  /**
   * Open the modal
   */
  const open = async () => {
    // Set the working items
    setWorkingSelectedItems(selectedItems);

    // Open the modal
    await modal.current?.present();

    // Set focus on the search bar
    searchBar.current?.setFocus();
  };

  /**
   * Close the modal and discard the selected items
   */
  const closeDiscard = () => {
    // Close the modal
    modal.current?.dismiss();
  };

  /**
   * Close the modal and save the selected items
   */
  const closeSave = () => {
    // Set the selected items
    setSelectedItems(workingSelectedItems);

    // Close the modal
    modal.current?.dismiss();
  };

  /**
   * Check if a value is checked
   * @param value Value to check
   * @returns Whether or not the value is checked
   */
  const isChecked = (value: string) =>
    workingSelectedItems.findIndex(item => item[itemValueKey] === value) !== -1;

  /**
   * Search input handler
   * @param event Search input event
   */
  const onSearchInput = (event: SearchbarCustomEvent) => {
    setQuery(event.detail.value ?? "");
  };

  /**
   * Checkbox change handler
   * @param event Checkbox change event
   */
  const onCheckboxChange = (event: CheckboxCustomEvent<string>) => {
    // Get the selected item
    const selectedItem = items.find(
      item => item[itemValueKey] === event.detail.value,
    ) as T;

    // Generate the new selected items
    const newSelectedItems = event.detail.checked
      ? [...workingSelectedItems, selectedItem]
      : workingSelectedItems.filter(
          item => item[itemValueKey] !== event.detail.value,
        );

    // Emit the change event
    setWorkingSelectedItems(newSelectedItems);
  };

  /**
   * Radio group change handler
   * @param event Radio group change event
   */
  const onRadioGroupChange = (event: RadioGroupCustomEvent<string>) => {
    // Get the selected item
    const selectedItem = items.find(
      item => item[itemValueKey] === event.detail.value,
    ) as T;

    // Emit the change event
    setWorkingSelectedItems([selectedItem]);
  };

  return (
    <>
      {children(open)}

      <IonModal ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={closeDiscard}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>{label}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={closeSave}>Done</IonButton>
            </IonButtons>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar onIonInput={onSearchInput} ref={searchBar} />
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonList inset={true}>
            {multiple &&
              filteredItems.map(item => (
                <IonItem key={item[itemValueKey] as string}>
                  <IonCheckbox
                    value={item[itemValueKey]}
                    checked={isChecked(item[itemValueKey] as string)}
                    onIonChange={onCheckboxChange}
                  >
                    {itemRenderer(item)}
                  </IonCheckbox>
                </IonItem>
              ))}
            {!multiple && (
              <IonRadioGroup
                value={workingSelectedItems[0]?.[itemValueKey]}
                onIonChange={onRadioGroupChange}
              >
                {filteredItems.map(item => (
                  <IonItem key={item[itemValueKey] as string}>
                    <IonRadio value={item[itemValueKey]}>
                      {itemRenderer(item)}
                    </IonRadio>
                  </IonItem>
                ))}
              </IonRadioGroup>
            )}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
};
