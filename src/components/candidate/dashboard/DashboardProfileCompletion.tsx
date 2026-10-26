import { Link } from "react-router-dom";
import type { ProfileCompletionResult } from "@/features/profile/types";
import { DashboardIcon } from "./DashboardIcon";
import { CompletionDetails } from "./CompletionDetails";
import { CompletionRing } from "./CompletionRing";
import { completionCriterionText } from "@/features/candidates/dashboard/completionCriterionText";

interface DashboardProfileCompletionProps {
  completion: ProfileCompletionResult;
  animate: boolean;
}

export function DashboardProfileCompletion({
  completion,
  animate,
}: DashboardProfileCompletionProps) {
  const percentage = completion.completionPercentage;
  const missingItem = completion.completionItems.find((item) => !item.isCompleted);

  return (
    <div className="relative flex w-full min-w-0 items-center gap-3 md:w-auto md:min-w-[230px]">
      <CompletionRing
        percentage={percentage}
        items={completion.completionItems}
        animate={animate}
      />
      <div className="min-w-0 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-white">
          {percentage === 100 ? "Profil complet" : `Profil complété à ${percentage} %`}
        </p>
        <CompletionDetails items={completion.completionItems} />
        {percentage < 100 && missingItem && (
          <Link
            to={missingItem.route}
            className="mt-1 block text-xs leading-5 text-white/85 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Prochaine étape : ajouter{" "}
            {completionCriterionText[missingItem.id] ??
              missingItem.label.toLocaleLowerCase("fr-FR")}{" "}
            <DashboardIcon name="ArrowRight" size={13} className="inline" />
          </Link>
        )}
      </div>
    </div>
  );
}
