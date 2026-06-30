export type CityGroup = {
  country: string;
  cities: string[];
};

export const centralAfricaCityGroups: CityGroup[] = [
  {
    country: "Angola",
    cities: [
      "Luanda",
      "Huambo",
      "Benguela",
      "Lobito",
      "Cabinda",
      "Lubango",
      "Malanje",
      "Soyo",
    ],
  },
  {
    country: "Burundi",
    cities: [
      "Gitega",
      "Bujumbura",
      "Ngozi",
      "Muyinga",
      "Ruyigi",
      "Karuzi",
    ],
  },
  {
    country: "Cameroun",
    cities: [
      "Yaoundé",
      "Douala",
      "Garoua",
      "Maroua",
      "Bamenda",
      "Bafoussam",
      "Kribi",
      "Bertoua",
    ],
  },
  {
    country: "République centrafricaine",
    cities: [
      "Bangui",
      "Bambari",
      "Bossangoa",
      "Berbérati",
      "Carnot",
      "Bria",
    ],
  },
  {
    country: "Tchad",
    cities: [
      "N'Djamena",
      "Moundou",
      "Sarh",
      "Abéché",
      "Koumra",
      "Bongor",
    ],
  },
  {
    country: "Congo",
    cities: [
      "Brazzaville",
      "Pointe-Noire",
      "Dolisie",
      "Ouesso",
      "Oyo",
      "Pokola",
      "Nkayi",
      "Owando",
      "Sangha",
      "Cuvette Ouest",
      "Impfondo",
      "Sibiti",
    ],
  },
  {
    country: "République démocratique du Congo",
    cities: [
      "Kinshasa",
      "Lubumbashi",
      "Mbuji-Mayi",
      "Kisangani",
      "Goma",
      "Bukavu",
      "Kananga",
      "Kolwezi",
    ],
  },
  {
    country: "Guinée équatoriale",
    cities: [
      "Malabo",
      "Bata",
      "Ebebiyin",
      "Mongomo",
      "Evinayong",
    ],
  },
  {
    country: "Gabon",
    cities: [
      "Libreville",
      "Port-Gentil",
      "Franceville",
      "Oyem",
      "Moanda",
    ],
  },
  {
    country: "Rwanda",
    cities: [
      "Kigali",
      "Butare",
      "Gisenyi",
      "Ruhengeri",
      "Gitarama",
    ],
  },
  {
    country: "Sao Tomé-et-Principe",
    cities: [
      "São Tomé",
      "Santo António",
      "Neves",
      "Trindade",
    ],
  },
];

export const centralAfricaCityCountryMap = new Map<string, string>(
  centralAfricaCityGroups.flatMap((group) => group.cities.map((city) => [city, group.country] as const)),
);
