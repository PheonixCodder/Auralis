"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { CheckCircleIcon, PhoneIcon, XCircleIcon } from "lucide-react";
import { useVapiPhoneNumbers } from "../../hooks/use-vapi-data";

export const VapiPhoneNumbersTab = () => {
  const { data: phoneNumbers, isLoading } = useVapiPhoneNumbers();

  return (
    <div className="border-t bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Phone Number</TableHead>
            <TableHead className="px-6 py-4">Name</TableHead>
            <TableHead className="px-6 py-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Loading phone numbers...
                  </TableCell>
                </TableRow>
              );
            }
            if (phoneNumbers.length === 0) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No phone numbers found. Please add a phone number in your
                    Vapi dashboard to get started.
                  </TableCell>
                </TableRow>
              );
            }

            return phoneNumbers.map((phone) => (
              <TableRow className="hover:bg-muted/50" key={phone.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span className="font-mono">{phone.number}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">{phone.name}</TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    variant={
                      phone.status === "active" ? "default" : "destructive"
                    }
                    className="capitalize"
                  >
                    {phone.status === "active" && (
                      <CheckCircleIcon className="size-3 mr-1" />
                    )}
                    {phone.status !== "active" && (
                      <XCircleIcon className="size-3 mr-1" />
                    )}
                    {phone.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </div>
  );
};
