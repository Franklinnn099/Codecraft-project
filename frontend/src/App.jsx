import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/") // backend endpoint
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => setMessage("Error connecting to backend"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-white bg-red-500 p-4 text-2xl rounded-lg">
        Tailwind is Working 🎉
      </h1>
      <p className="mt-4 text-green-500 text-xl">{message}</p>
    </div>
  );
}

export default App;
