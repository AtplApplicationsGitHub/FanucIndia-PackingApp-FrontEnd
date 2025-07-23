import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RequiredLabel } from "@/components/common/RequiredLabel";

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
};

const PaymentClearanceToggle: React.FC<Props> = ({ value, onChange, error }) => (
  <div className="flex flex-col gap-1">
    <RequiredLabel>Payment Clearance</RequiredLabel>
    <RadioGroup
      className="w-full flex flex-row gap-6 mt-2"
      value={value}
      onValueChange={(val) => onChange("paymentClearance", val)}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="true" id="payment-yes" />
        <Label htmlFor="payment-yes">Yes</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="false" id="payment-no" />
        <Label htmlFor="payment-no">No</Label>
      </div>
    </RadioGroup>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

export default PaymentClearanceToggle;
