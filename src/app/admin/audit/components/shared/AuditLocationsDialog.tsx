"use client";

import AuditTableDialog from "./AuditTableDialog";

type Props = {
  open: boolean;
  title: string;
  locations: string[];
  onClose: () => void;
};

export default function AuditLocationsDialog({
  open,
  title,
  locations,
  onClose,
}: Props) {
  return (
    <AuditTableDialog
      open={open}
      title={title}
      columns={[{ label: "Location" }]}
      rows={locations.map((l) => [l])}
      emptyText="No locations found."
      onClose={onClose}
    />
  );
}
