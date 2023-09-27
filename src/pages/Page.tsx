import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {useParams} from "react-router";
import {Markdown} from "~/components/markdown/Markdown";
import "~/pages/Page.css";

/**
 * Page component
 * @returns JSX
 */
const Page: React.FC = () => {
  const {name} = useParams<{name: string}>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <Markdown />
      </IonContent>
    </IonPage>
  );
};

export default Page;
