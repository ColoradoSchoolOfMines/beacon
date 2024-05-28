### Why can I not see any posts?

There are a few reasons why you may not see any posts:

- There are no posts in your area - that means you can be the first person to post in your area!
- You denied location permissions to your browser and/or Beacon. Check your device/browser settings to ensure you have granted location permissions to the browser itself **and** to Beacon.

### Why is my location incorrect?

We use the location information provided by your device, which may not always be accurate. You can try the following to improve the accuracy of your location:

1. Ensure you have granted precise location permissions to your browser.
2. Ensure sure you have allowed the browser to access your location.
3. Ensure you have enabled location services on your device.
4. Turn on Wi-Fi and Bluetooth on your device (Which many devices use to improve location accuracy).

_Note that when you make a post, we also add a small random offset to your location to protect your privacy. This offset can be up to 10% of the radius you specify for the post._

### Why do I keep getting geolocation permission errors? / Why can't I add a photo or video to my post?

You have not granted (sufficient) permissions to your browser to access your device's camera and/or gallery. See the **What permissions does Beacon require?** section for more information.

### What permissions does Beacon require?

In general, Beacon requires precise geolocation permissions to show you posts in your area. Furthermore, if you want to make a post, Beacon requires permissions to access your device's camera and/or gallery to add photos and videos to your post. The following are the bare-minimum permissions that have been tested to work with Beacon:

#### Chrome for Android

- `Camera`: `Ask every time`

#### Firefox for Android

- `Location`: `Allow only while using the app` with `Use precise location` enabled
- `Music and audio`: `Allow`
- `Photos and videos`: `Always allow all`
- `Camera`: `Ask every time`
- `Microphone`: `Ask every time`

### How do I add rich-text features to posts or comments?

Beacon supports Markdown (specifically a subset of Github-Flavored Markdown/GFM), including:

**\*\*Bolded text\*\***, _\*Italicized text\*_, <u>\<u>Underlined text\</u></u>, <del>\~\~Striked-through text\~\~</del>, <sup>\<sup>Superscript text\</sup></sup>, <sub>\<sub>Subscript text\</sub></sub>,`` `inline code` ``,

````
```
block code
```
````

> \> First-level quote

> > \>\> Second-level quote

_Etc._

# \# Top-level heading

## \#\# Second-level heading

_Etc._

Thematic breaks:

```markdown
---
```

---

Expandable sections:

```markdown
<details>
  <summary>Click to expand</summary>

This is a collapsible section.

</details>
```

<details>
  <summary>Click to expand</summary>

This is a collapsible section.

</details>

```markdown
| Tables | Are  | Cool |
| ------ | ---- | ---- |
| Yes    | They | Are  |
```

| Tables | Are  | Cool |
| ------ | ---- | ---- |
| Yes    | They | Are  |
