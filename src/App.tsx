import type { Component } from "solid-js";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <p class="text-4xl text-green-700 text-center py-20">
      <Button>Click me</Button>
      <Button variant="outline">Click me</Button>
      <Button variant="secondary">Click me</Button>
      <Button variant="destructive">Click me</Button>
      <Button variant="ghost">Click me</Button>
      <Button variant="link">Click me</Button>
    </p>
  );
}
