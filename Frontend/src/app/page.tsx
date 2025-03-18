"use client";
import "@/app/style.css";
import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function Home() {
  const [transferenciaId, setTransferenciaId] = useState<number | "">("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setTransferenciaId(value ? parseInt(value, 10) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferenciaId) {
      toast.error("Por favor, insira um código de transferência válido.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_CLIENT}/printById`, { transferenciaId });
      response.data.length == 0 ? toast.error("Não existe esta transferência") : toast.success("Imprimindo...");
      setTransferenciaId("");
    } catch (error) {
      console.error("Erro ao Imprimir:", error);
      toast.error("Erro ao Imprimir!");
    }
  };

  return (
    <div style={{ justifyItems: "center" }}>
      <h1 style={{ marginBottom: "35px" }}>Impressão de Transferência</h1>
      <form method="post" className="formContainer" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onInput={handleInput}
            placeholder="Código da Transferência"
            className="input"
            autoComplete="off"
            autoFocus
            id="transferencia"
            value={transferenciaId}
            maxLength={10}
          />
        </div>
        <button className="button" type="submit">Imprimir</button>
      </form>
      <ToastContainer />
    </div>
  );
}
