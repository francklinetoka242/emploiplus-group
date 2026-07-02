export type CityGroup = {
  country: string;
  countryCode: string;
  cities: string[];
};

export const centralAfricaCityGroups: CityGroup[] = [
  {
    country: "Angola",
    countryCode: "+244",
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
    countryCode: "+257",
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
    countryCode: "+237",
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
    countryCode: "+236",
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
    countryCode: "+235",
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
    countryCode: "+242",
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
    countryCode: "+243",
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
    countryCode: "+240",
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
    countryCode: "+241",
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
    countryCode: "+250",
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
    countryCode: "+239",
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
