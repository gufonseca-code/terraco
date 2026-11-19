import {
  FacadeBackdrop,
  FacadeForegroundStructure,
} from "@/components/hero-svg/FacadeArchitecture";
import { BalconyFoliage } from "@/components/hero-svg/BalconyFoliage";
import { ForegroundFoliage } from "@/components/hero-svg/ForegroundFoliage";

export function HeroSvgPrototype({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 1280"
      preserveAspectRatio="xMinYMin slice"
      aria-hidden="true"
      focusable="false"
      className={className ?? "h-full w-full"}
    >
      <FacadeBackdrop />
      <BalconyFoliage />
      <FacadeForegroundStructure />
      <ForegroundFoliage />
    </svg>
  );
}
