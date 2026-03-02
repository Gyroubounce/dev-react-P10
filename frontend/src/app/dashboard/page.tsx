import Image from "next/image";
import Taches from "@/app/assets/Taches.png";
import Kanban from "@/app/assets/Kanban.png";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">

      {/* Titre + bouton */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-manrope font-semibold">
          Tableau de bord
        </h1>

        <button className="px-4 py-2 rounded-md bg-brand-dark text-white font-manrope">
          + Créer un projet
        </button>
      </div>

        {/* Boutons Liste / Kanban */}
      <div className="flex gap-3">

        {/* Bouton Liste */}
        <button
          className="px-4 py-2 rounded-md bg-brand-light text-brand-dark flex items-center gap-2"
        >
          <Image
            src={Taches}
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
          />
          Liste
        </button>

        {/* Bouton Kanban */}
        <button
          className="px-4 py-2 rounded-md bg-white border border-brand-dark text-brand-dark flex items-center gap-2"
        >
          <Image
            src={Kanban}
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
          />
          Kanban
        </button>

      </div>

      {/* Section Mes tâches */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[20px] font-manrope font-semibold">
          Mes tâches assignées
        </h2>

        <div className="grid grid-cols-3 gap-4">

          {/* Carte tâche */}
          <div className="bg-white shadow-(--shadow-card) rounded-(--radius-card) p-4 border border-system-neutral">
            <p className="font-manrope font-semibold text-text-primary">
              Intégrer le Header Abricot
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Projet Abricot
            </p>
          </div>

          <div className="bg-white shadow-(--shadow-card) rounded-(--radius-card) p-4 border border-system-neutral">
            <p className="font-manrope font-semibold text-text-primary">
              Créer la page Dashboard
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Projet Abricot
            </p>
          </div>

          <div className="bg-white shadow-(--shadow-card) rounded-(--radius-card) p-4 border border-system-neutral">
            <p className="font-manrope font-semibold text-text-primary">
              Styliser les composants
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Projet Abricot
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
