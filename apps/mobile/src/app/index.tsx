import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Icon } from "@repo/ui/components/ui/icon";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Text } from "@repo/ui/components/ui/text";
import { Rocket } from "lucide-react-native";
import { View } from "react-native";

function DialogPreview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Text>Open Dialog</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <View className="grid gap-4">
          <View className="grid gap-3">
            <Label htmlFor="name-1">Name</Label>
            <Input id="name-1" defaultValue="Pedro Duarte" />
          </View>
          <View className="grid gap-3">
            <Label htmlFor="username-1">Username</Label>
            <Input id="username-1" defaultValue="@peduarte" />
          </View>
        </View>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button>
            <Text>Save changes</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccordionPreview() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-lg" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <Text>Product Information</Text>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <Text>
            Our flagship product combines cutting-edge technology with sleek design. Built with
            premium materials, it offers unparalleled performance and reliability.
          </Text>
          <Text>
            Key features include advanced processing capabilities, and an intuitive user interface
            designed for both beginners and experts.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <Text>Shipping Details</Text>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <Text>
            We offer worldwide shipping through trusted courier partners. Standard delivery takes
            3-5 business days, while express shipping ensures delivery within 1-2 business days.
          </Text>
          <Text>
            All orders are carefully packaged and fully insured. Track your shipment in real-time
            through our dedicated tracking portal.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <Text>Return Policy</Text>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <Text>
            We stand behind our products with a comprehensive 30-day return policy. If you&apos;re
            not completely satisfied, simply return the item in its original condition.
          </Text>
          <Text>
            Our hassle-free return process includes free return shipping and full refunds processed
            within 48 hours of receiving the returned item.
          </Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
      <Text className="text-xl font-bold text-foreground">React Native Reusables</Text>
      <Button>
        <Icon as={Rocket} className="text-primary-foreground" />
        <Text>Get started</Text>
      </Button>
      <Button>
        <Text>Button</Text>
      </Button>
      <DialogPreview />
      <AccordionPreview />
    </View>
  );
}
