/**
 * @file Auth page
 */

import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {useState} from "react";

import {Step1} from "~/components/auth/Step1";
import {Step2A} from "~/components/auth/Step2A";
import {Step3A} from "~/components/auth/Step3A";
import {Step4A} from "~/components/auth/Step4A";

/**
 * Auth step
 */
export enum AuthStep {
  STEP1 = "1",
  STEP2A = "2A",
  STEP3A = "3A",
  STEP4A = "4A",
}

/**
 * Get step from raw string
 * @param raw Raw string
 * @returns Step or undefined
 */
const getStep = (raw: string) => {
  switch (raw.toUpperCase()) {
    case AuthStep.STEP1:
      return AuthStep.STEP1;

    case AuthStep.STEP2A:
      return AuthStep.STEP2A;

    case AuthStep.STEP3A:
      return AuthStep.STEP3A;

    case AuthStep.STEP4A:
      return AuthStep.STEP4A;

    default:
      return undefined;
  }
};

/**
 * Auth page component
 * @returns JSX
 */
export const Auth: React.FC = () => {
  // Constants
  const defaultStep =
    new URLSearchParams(window.location.search).get("step") ?? "";

  // Hooks
  const [step, setStep] = useState<AuthStep>(
    getStep(defaultStep) ?? AuthStep.STEP1,
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Authentication</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false}>
        <div className="flex flex-col items-center justify-center h-full w-full">
          <IonCard>
            <IonCardHeader className="text-center">
              <IonCardTitle>Authentication</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {(() => {
                switch (step) {
                  case AuthStep.STEP1:
                    return <Step1 step={step} setStep={setStep} />;

                  case AuthStep.STEP2A:
                    return <Step2A step={step} setStep={setStep} />;

                  case AuthStep.STEP3A:
                    return <Step3A step={step} setStep={setStep} />;

                  case AuthStep.STEP4A:
                    return <Step4A step={step} setStep={setStep} />;

                  default:
                    return <p>Unknown step {step}</p>;
                }
              })()}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};
