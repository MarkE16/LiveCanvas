import { Eye as LucideEye, EyeOff as LucideEyeOff } from "lucide-react";

const Eye = ({ lineCross = false }: { lineCross: boolean }) =>
	lineCross ? <LucideEyeOff size="1em" /> : <LucideEye size="1em" />;

export default Eye;
