/**
 * AnalyticsOfferTable Component
 * Display detailed offers table
 */

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { OfferAnalytics } from "@/features/admin/types/analytics";

interface AnalyticsOfferTableProps {
  offers: OfferAnalytics[];
  total: number;
  loading: boolean;
}

export function AnalyticsOfferTable({ offers, total, loading }: AnalyticsOfferTableProps) {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  if (offers.length === 0 && !loading) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Détails des Offres</h3>
        <span className="text-sm text-muted-foreground">{total} offre(s)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Titre</th>
              <th className="text-left py-3 px-4 font-medium">Entreprise</th>
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Localisation</th>
              <th className="text-right py-3 px-4 font-medium">Candidatures</th>
              <th className="text-center py-3 px-4 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.offerId} className="border-b hover:bg-muted/50 transition">
                <td className="py-3 px-4">
                  <div className="font-medium truncate">{offer.title}</div>
                </td>
                <td className="py-3 px-4 truncate">{offer.company}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline">{offer.contractType || "N/A"}</Badge>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {offer.locationCity || "N/A"}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  {offer.applicationCount}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    variant={offer.status === "published" ? "default" : "secondary"}
                  >
                    {offer.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
