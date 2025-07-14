export const animationClasses = {
  fadeIn: "animate-fade-in",
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right",
  slideInUp: "animate-slide-in-up",
  scaleIn: "animate-scale-in",
  hoverLift: "hover:shadow-xl transition-transform hover:-translate-y-1",
  hoverScale: "hover:scale-[1.02] transition-transform",
  pulse: "animate-pulse",
};

export function useAnimation(): boolean {
  // For now, always return true (for example/demo purposes)
  return true;
}
