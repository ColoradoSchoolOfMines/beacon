import "~/pages/Page.css";

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

import {Markdown} from "~/components/Markdown";

/**
 * Page component
 * @returns JSX
 */
export const Page: React.FC = () => {
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
        <Markdown
          raw="# H1
## H2
### H3
#### H4
##### H5
###### H6

*Italic*
**Bold**
***Bold Italic***
~~Strikethrough~~


[Link](https://example.com)
[XSS](javascript:alert('XSS'))

> 1
>> 2
>>> 3
>>>> 4
>>>>> 5
>>>>>> 6
>>>>>>> 7
>>>>>>>> 8
>>>>>>>>> 9
>>>>>>>>>> 10
>>>>>>>>>>> 11
>>>>>>>>>>>> 12
>>>>>>>>>>>>> 13
>>>>>>>>>>>>>> 14
>>>>>>>>>>>>>>> 15
>>>>>>>>>>>>>>>> 16
>>>>>>>>>>>>>>>>> 17
>>>>>>>>>>>>>>>>>> 18
>>>>>>>>>>>>>>>>>>> 19
>>>>>>>>>>>>>>>>>>>> 20
>>>>>>>>>>>>>>>>>>>>> 21
>>>>>>>>>>>>>>>>>>>>>> 22
>>>>>>>>>>>>>>>>>>>>>>> 23
>>>>>>>>>>>>>>>>>>>>>>>> 24

---

- List
- List
- List

1. List
2. List
3. List

![Image](https://github.com/ghost.png)

```javascript
console.log('Hello, world!');
```
"
        />
      </IonContent>
    </IonPage>
  );
};
