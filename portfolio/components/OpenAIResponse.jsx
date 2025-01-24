import React, { useEffect } from "react";

export default function OpenAIResponse() {
  
  const fetchOpenAIResponse = async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      console.error("Missing OpenAI API key in environment variables");
      return;
    }

    const prompt = `"Generate like 50 of these, Write concise, meaningful, and well-connected statements for the following topics: Generative AI, Backend Development, Cloud Computing, Mathematics (Linear Algebra and Calculus), and Machine Learning.

Each topic should:

    Be written in first-person perspective.
    Include only 1 sentence per topic, highlighting key ideas.
    Use simple and clear language to express passion and understanding.

Example (Few-Shot Prompting):

Generative AI:
"Passionate about leveraging generative AI 
to drive innovation by blending creativity 
with cutting-edge technology."

Backend Development:
"I specialize in designing efficient backend systems,
ensuring seamless data flow, robust logic, and 
optimized performance for reliable applications."

Cloud Computing:
"I build scalable and adaptive cloud solutions, 
enabling seamless connectivity and accessibility, 
unlocking new possibilities with every deployment."

Mathematics (Linear Algebra and Calculus):
"I leverage the power of mathematics to model and 
solve complex problems, discovering patterns in 
data and spaces to reveal deeper insights."

Machine Learning:
"I design intelligent systems by uncovering patterns 
in data, building adaptable models, and driving 
innovative solutions to evolving challenges."`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, // Use the API key from environment variable
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch OpenAI response");
      }

      const data = await response.json();

      // Log the result to the console
      console.log("OpenAI Response:", data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
    }
  };

  useEffect(() => {
    fetchOpenAIResponse();
  }, []);

  return <div>Check the console for the OpenAI API response!</div>;
}
