# **App Name**: Kisan Mitra

## Core Features:

- Crop Disease Diagnosis: Analyzes uploaded image of crop to identify potential diseases or pests using Vertex Vision / Gemini Multimodal API, offering diagnosis and remedies. LLM reasons about what disease is indicated by the images, to guide suggestions to the user.
- Market Price Analysis: Fetches the current market prices for specified crops from public APIs (e.g., AGMARKNET) and uses Gemini to provide a summary of prices and advises farmers on whether to sell or wait. Gemini serves as a tool for the app. The tool reasons about the state of the data and presents findings appropriately to the user.
- Government Scheme Information: Leverages Gemini to understand farmer queries related to government schemes, matching relevant schemes and summarizing eligibility criteria along with application links based on preloaded data. The LLM will use reasoning to determine the appropriate way to present government services, working as a tool in the app.
- User Input Interface: Allows farmers to input queries or upload images through a simple and intuitive web interface. The app supports voice input (STT) and text input modalities.
- Voice Response System: Converts text responses into audio using Google TTS API and plays it back in the local dialect to cater to diverse language preferences.
- Data Logging and Session Management: Stores user sessions, queries, images, and provided recommendations in Firebase Firestore to facilitate personalized experiences and improve service accuracy.

## Style Guidelines:

- Primary color: A muted green (#90EE90), reminiscent of crops and nature, fostering trust. Avoids strong or overly saturated colors.
- Background color: Light gray (#F0F0F0), offering a clean, non-distracting backdrop for content. Has a similar hue to the muted green primary color, but highly desaturated.
- Accent color: Soft yellow (#FADA5E), an analogous hue to green, used for calls to action and to highlight important information.
- Body: 'PT Sans', a versatile humanist sans-serif, well-suited to large blocks of text. Headings: 'Space Grotesk', giving the UI a modern techy feel. This pairing combines warmth with high-tech, giving users a sense of an old problem being tackled by a new and effective tool.
- Simple, clear icons to represent different crops, diseases, schemes, and functionalities, enhancing usability and understanding.
- Clean, intuitive layout with clear sections for image upload, text input, and response display to facilitate easy navigation.
- Subtle animations when fetching data or transitioning between sections, providing a smooth and engaging user experience.