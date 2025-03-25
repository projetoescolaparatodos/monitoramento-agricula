
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { auth } from "../utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Gestor() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLocation("/gestor/login");
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Gestor</h1>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agricultura</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => setLocation("/gestor/agricultura")}
              >
                Gerenciar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pesca</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => setLocation("/gestor/pesca")}
              >
                Gerenciar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PAA</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => setLocation("/gestor/paa")}
              >
                Gerenciar
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
