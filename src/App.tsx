import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function App() {
	return (
		<div class="flex flex-col gap-16 w-full justify-center items-center">
			<div class="flex flex-col gap-4 w-min">
				<p>Buttons</p>
				<Button>Click me</Button>
				<Button variant="outline">Click me</Button>
				<Button variant="secondary">Click me</Button>
				<Button variant="destructive">Click me</Button>
				<Button variant="ghost">Click me</Button>
				<Button variant="link">Click me</Button>
			</div>

			<div class="flex flex-col gap-4">
				<p>Tabs</p>
				<Tabs>
					<TabsList>
						<TabsTrigger>Tab 1</TabsTrigger>
						<TabsTrigger>Tab 2</TabsTrigger>
						<TabsTrigger>Tab 3</TabsTrigger>
					</TabsList>
					<TabsContent>Tab 1</TabsContent>
					<TabsContent>Tab 2</TabsContent>
					<TabsContent>Tab 3</TabsContent>
				</Tabs>
			</div>

			<div class="flex flex-col gap-4">
				<p>Alert</p>
				<Alert>Alert</Alert>
				<Alert variant="destructive">
					<AlertTitle>Alert</AlertTitle>
					<AlertDescription>Alert</AlertDescription>
				</Alert>
			</div>

			<div class="flex flex-col gap-4">
				<p>Textarea</p>
				<Textarea placeholder="Textarea" />
			</div>

			<div class="flex flex-col gap-4">
				<p>Switch</p>
				<Switch>Switch</Switch>
				<Switch size="sm">Switch</Switch>
			</div>

			<div class="flex flex-col gap-4">
				<p>Label</p>
				<Label>Label</Label>
			</div>
		</div>
	);
}
