/**
 * AdminAnalyticsOffresPage
 * Main analytics dashboard for job offers and applications
 */

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Filter, RotateCw } from "lucide-react";
import { useAnalyticsOffres } from "@/features/admin/hooks/useAnalyticsOffres";
import type { AnalyticsFilter, DatePreset } from "@/features/admin/types/analytics";
import { getDateRangeForPreset } from "@/features/admin/utils/datePresets";
import { DateInput } from "@/components/ui/date-input";
import {
  AnalyticsKPICards,
  AnalyticsTrendChart,
  AnalyticsOfferTable,
  AnalyticsCompanyChart,
  AnalyticsContractChart,
  AnalyticsLocationChart,
  AnalyticsStatusChart,
  AnalyticsExport,
  AnomaliesDisplay,
} from "./components";
import { DatePresets } from "./components/DatePresets";
import { PeriodComparisonDisplay } from "./components/PeriodComparisonDisplay";

export default function AdminAnalyticsOffresPage() {
  const { t } = useI18n();
  const analytics = useAnalyticsOffres();

  const [filter, setFilter] = useState<AnalyticsFilter>({
    dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)),
    dateTo: new Date(),
    preset: "30days",
    company: null,
    jobOfferId: null,
    contractType: null,
    locationCity: null,
    locationCountry: null,
    applicationStatus: null,
  });

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Load data on component mount and when filter changes
  useEffect(() => {
    analytics.fetchData(filter);
  }, [filter]);

  // Load offer details on mount
  useEffect(() => {
    analytics.fetchOfferDetails(filter, pageSize, 0);
  }, [filter, pageSize]);

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setFilter((prev) => ({ ...prev, dateFrom: date, preset: "custom" }));
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setFilter((prev) => ({ ...prev, dateTo: date, preset: "custom" }));
  };

  const handlePresetChange = (preset: DatePreset) => {
    if (preset === "custom") {
      setFilter((prev) => ({ ...prev, preset: "custom" }));
    } else {
      const range = getDateRangeForPreset(preset);
      setFilter((prev) => ({ ...prev, dateFrom: range.from, dateTo: range.to, preset }));
    }
  };

  const handleResetFilters = () => {
    setFilter({
      dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)),
      dateTo: new Date(),
      preset: "30days",
      company: null,
      jobOfferId: null,
      contractType: null,
      locationCity: null,
      locationCountry: null,
      applicationStatus: null,
    });
  };

  const hasActiveFilters =
    filter.company ||
    filter.jobOfferId ||
    filter.contractType ||
    filter.locationCity ||
    filter.locationCountry ||
    filter.applicationStatus;

  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-5 p-4 md:p-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
                Administration
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Analytics-Offres
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Analyse complète des offres d'emploi et des candidatures
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => analytics.fetchData(filter)}
                disabled={analytics.loading}
                className="rounded-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <Button
                size="sm"
                onClick={() => setShowExportDialog(true)}
                disabled={analytics.loading}
                className="rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Filter className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Filtres</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Date Presets */}
          <div className="mb-4 pb-4 border-b">
            <label className="block text-sm font-medium mb-3">Période</label>
            <DatePresets currentPreset={filter.preset} onSelect={handlePresetChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium mb-2">Du</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <DateInput
                  value={filter.dateFrom?.toISOString().split("T")[0] || ""}
                  onChange={handleDateFromChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium mb-2">Au</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <DateInput
                  value={filter.dateTo?.toISOString().split("T")[0] || ""}
                  onChange={handleDateToChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Entreprise</label>
              <input
                type="text"
                placeholder="Filtrer par entreprise"
                value={filter.company || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    company: e.target.value || null,
                  }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Contract Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Type de contrat</label>
              <select
                value={filter.contractType || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    contractType: e.target.value || null,
                  }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Tous les types</option>
                <option value="cdi">CDI</option>
                <option value="cdd">CDD</option>
                <option value="stage">Stage</option>
                <option value="freelance">Freelance</option>
                <option value="prestation_de_services">Prestation de services</option>
                <option value="consultance">Consultance</option>
                <option value="temps_partiel">Temps partiel</option>
                <option value="interim">Intérim</option>
              </select>
            </div>

            {/* Application Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Statut candidature</label>
              <select
                value={filter.applicationStatus || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    applicationStatus: e.target.value || null,
                  }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Tous les statuts</option>
                <option value="submitted">Soumis</option>
                <option value="reviewed">Examiné</option>
                <option value="shortlisted">Présélectionné</option>
                <option value="rejected">Rejeté</option>
                <option value="accepted">Accepté</option>
                <option value="withdrawn">Retiré</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Ville</label>
              <input
                type="text"
                placeholder="Filtrer par ville"
                value={filter.locationCity || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    locationCity: e.target.value || null,
                  }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Pays</label>
              <input
                type="text"
                placeholder="Filtrer par pays"
                value={filter.locationCountry || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    locationCountry: e.target.value || null,
                  }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </Card>

        {/* KPI Cards */}
        <AnalyticsKPICards analytics={analytics} />

        {/* Anomalies */}
        {analytics.anomalies.length > 0 && (
          <AnomaliesDisplay anomalies={analytics.anomalies} />
        )}

        {/* Trends Chart */}
        {analytics.applicationsTrend.length > 0 ? (
          <AnalyticsTrendChart trends={analytics.applicationsTrend} />
        ) : (
          !analytics.loading && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Aucune tendance à afficher pour la période sélectionnée</p>
            </Card>
          )
        )}

        {/* Analysis by dimension */}
        {analytics.companyAnalytics.length > 0 ||
        analytics.contractAnalytics.length > 0 ||
        analytics.statusAnalytics.length > 0 ||
        analytics.locationAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.companyAnalytics.length > 0 && (
              <AnalyticsCompanyChart companies={analytics.companyAnalytics} />
            )}
            {analytics.contractAnalytics.length > 0 && (
              <AnalyticsContractChart contracts={analytics.contractAnalytics} />
            )}
            {analytics.statusAnalytics.length > 0 && (
              <AnalyticsStatusChart statuses={analytics.statusAnalytics} />
            )}
            {analytics.locationAnalytics.length > 0 && (
              <AnalyticsLocationChart locations={analytics.locationAnalytics} />
            )}
          </div>
        ) : (
          !analytics.loading && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Aucune donnée d'analyse disponible pour la période sélectionnée</p>
            </Card>
          )
        )}

        {/* Offers Table */}
        {analytics.offerAnalytics.length > 0 ? (
          <AnalyticsOfferTable
            offers={analytics.offerAnalytics}
            total={analytics.offerAnalyticsTotal}
            loading={analytics.loading}
          />
        ) : (
          !analytics.loading && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Aucune offre à afficher pour la période sélectionnée</p>
            </Card>
          )
        )}

        {/* Export Dialog */}
        {showExportDialog && (
          <AnalyticsExport
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            data={analytics}
            filter={filter}
          />
        )}

        {/* Loading/Error states */}
        {analytics.loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement des données...</p>
          </div>
        )}

        {analytics.error && (
          <Card className="p-4 border-destructive bg-destructive/10">
            <p className="text-sm text-destructive">{analytics.error}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
