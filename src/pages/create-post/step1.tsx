/**
 * @file Create post step 1 page
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
} from "@ionic/react";
import {
  arrowForwardOutline,
  arrowForwardSharp,
  codeSlashOutline,
  codeSlashSharp,
  eyeOutline,
  eyeSharp,
} from "ionicons/icons";
import {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {CreatePostContainer} from "~/components/create-post-container";
import {Markdown} from "~/components/markdown";
import {SupplementalError} from "~/components/supplemental-error";
import {useTemporaryStore} from "~/lib/stores/temporary";
import styles from "~/pages/create-post/step1.module.css";

/**
 * Content mode
 */
enum ContentMode {
  /**
   * View the raw content
   */
  RAW = "raw",

  /**
   * Preview the rendered content
   */
  PREVIEW = "preview",
}

/**
 * Minimum content length
 */
const MIN_CONTENT_LENGTH = 1;

/**
 * Maximum content length
 */
const MAX_CONTENT_LENGTH = 300;

/**
 * Form schema
 */
const formSchema = z.object({
  content: z.string().min(MIN_CONTENT_LENGTH).max(MAX_CONTENT_LENGTH),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Create post step 1 page
 * @returns JSX
 */
export const Step1: React.FC = () => {
  // Hooks
  const [contentTextarea, setContentTextarea] =
    // eslint-disable-next-line unicorn/no-null
    useState<HTMLIonTextareaElement | null>(null);

  const [contentMode, setContentMode] = useState<ContentMode>(ContentMode.RAW);

  const post = useTemporaryStore(state => state.post);
  const setPost = useTemporaryStore(state => state.setPost);

  const history = useHistory();

  const {control, handleSubmit, reset} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Effects
  useEffect(() => {
    if (contentTextarea === null) {
      return;
    }

    // Focus the content textarea
    if (contentMode === ContentMode.RAW) {
      // setFocus has a race condition
      setTimeout(() => contentTextarea.setFocus(), 10);
    }
  }, [contentMode, contentTextarea]);

  useEffect(() => {
    // Reset the form
    if (post === undefined) {
      reset();
    }
  }, [post]);

  // Methods
  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    // Update the post
    setPost({
      content: form.content,
    });

    // Go to the next step
    history.push("/posts/create/2");
  };

  return (
    <CreatePostContainer back={false}>
      <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
        <IonList className="flex flex-col h-full py-0">
          <Controller
            control={control}
            name="content"
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <div className="flex flex-col flex-1 px-4 pt-4">
                <IonLabel className="pb-2">Content</IonLabel>

                <div className="flex-1 relative">
                  <div className="absolute flex flex-col left-0 right-0 bottom-0 top-0">
                    {contentMode === ContentMode.RAW ? (
                      <IonTextarea
                        className={`h-full w-full ${styles.textarea}`}
                        autocapitalize="on"
                        counter={true}
                        fill="outline"
                        maxlength={MAX_CONTENT_LENGTH}
                        minlength={MIN_CONTENT_LENGTH}
                        onIonBlur={onBlur}
                        onIonInput={onChange}
                        ref={setContentTextarea}
                        spellcheck={true}
                        value={value}
                      />
                    ) : (
                      <>
                        <Markdown
                          className="break-anywhere h-full overflow-auto py-2 text-wrap w-full whitespace-pre"
                          raw={value}
                        />
                      </>
                    )}
                  </div>
                </div>

                <SupplementalError error={error?.message} />

                <IonSegment
                  className="mt-7"
                  value={contentMode}
                  onIonChange={event =>
                    setContentMode(event.detail.value as ContentMode)
                  }
                >
                  <IonSegmentButton layout="icon-start" value={ContentMode.RAW}>
                    <IonLabel>Raw</IonLabel>
                    <IonIcon ios={codeSlashOutline} md={codeSlashSharp} />
                  </IonSegmentButton>
                  <IonSegmentButton
                    layout="icon-start"
                    value={ContentMode.PREVIEW}
                  >
                    <IonLabel>Preview</IonLabel>
                    <IonIcon ios={eyeOutline} md={eyeSharp} />
                  </IonSegmentButton>
                </IonSegment>
              </div>
            )}
          />

          <IonItem className={`mt-4 ${styles.collapsedItem}`} />

          <div className="m-4">
            <IonButton
              className="m-0 overflow-hidden rounded-lg w-full"
              expand="full"
              type="submit"
            >
              Next
              <IonIcon
                slot="end"
                ios={arrowForwardOutline}
                md={arrowForwardSharp}
              />
            </IonButton>
          </div>
        </IonList>
      </form>
    </CreatePostContainer>
  );
};
