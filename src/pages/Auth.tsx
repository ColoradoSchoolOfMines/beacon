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
import {Step2B} from "~/components/auth/Step2B";
import {Step3B} from "~/components/auth/Step3B";
import {Step4B} from "~/components/auth/Step4B";

/**
 * Auth step
 */
export enum AuthStep {
  STEP1,
  STEP2B,
  STEP3B,
  STEP4B,
}

/**
 * Auth page component
 * @returns JSX
 */
export const Auth: React.FC = () => {
  const [step, setStep] = useState<AuthStep>(AuthStep.STEP1);

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

                  case AuthStep.STEP2B:
                    return <Step2B step={step} setStep={setStep} />;

                  case AuthStep.STEP3B:
                    return <Step3B step={step} setStep={setStep} />;

                  case AuthStep.STEP4B:
                    return <Step4B step={step} setStep={setStep} />;

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
