"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Participant } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface ParticipantFormProps {
  participantId?: string;
}

export function ParticipantForm({ participantId }: ParticipantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (participantId) {
      loadParticipant();
    }
  }, [participantId]);

  async function loadParticipant() {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .single();

    if (error) {
      console.error(" Error loading participant:", error);
      return;
    }

    const participant = data as Participant;
    setName(participant.name);
    setPhone(participant.phone || "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    try {
      if (participantId) {
        // Update existing participant
        const { error } = await supabase
          .from("participants")
          .update({ name, phone: phone || null })
          .eq("id", participantId);

        if (error) throw error;
      } else {
        // Create new participant
        const { error } = await supabase
          .from("participants")
          .insert({ name, phone: phone || null });

        if (error) throw error;
      }

      router.push("/admin/participants");
    } catch (error) {
      console.error(" Error saving participant:", error);
      alert("Error al guardar el participante");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Participante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del participante"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Guardando..." : "Guardar Participante"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/participants")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
