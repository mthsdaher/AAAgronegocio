import { useState } from "react";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { getListings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatNumberToBRL,
  parseBRLToNumber,
  sanitizeMoneyInput,
} from "@/lib/brlParse";
import { parseAreaHectares, sanitizeAreaInput } from "@/lib/areaParse";
import {
  LISTINGS_FILTER_SESSION_KEY,
  listingsParamsToSearch,
} from "@/lib/listingsQuery";
import type { GetListingsParams } from "@workspace/api-client-react";
import { MATO_GROSSO_DO_SUL_CITIES } from "@/data/matoGrossoDoSulCities";

const selectTriggerClass =
  "h-11 w-full rounded-xl border-neutral-200/90 bg-white/95 text-sm font-normal text-foreground shadow-none backdrop-blur-sm focus:ring-2 focus:ring-[#769363]/35";

const PROPERTY_TYPES = [
  { value: "todos", label: "Todos" },
  { value: "Fazenda", label: "Fazenda" },
  { value: "Sítio", label: "Sítio" },
  { value: "Chácara", label: "Chácara" },
  { value: "Rancho", label: "Rancho" },
  { value: "Haras", label: "Haras" },
  { value: "Agroindustrial", label: "Agroindustrial" },
] as const;

const APTITUDES = [
  { value: "todos", label: "Todos" },
  { value: "Apicultura", label: "Apicultura" },
  { value: "Aquicultura", label: "Aquicultura" },
  { value: "Área para Reserva", label: "Área para Reserva" },
  { value: "Dupla aptidão", label: "Dupla aptidão" },
  { value: "Floresta", label: "Floresta" },
  { value: "Frigorífico", label: "Frigorífico" },
  { value: "Granja", label: "Granja" },
  { value: "Laticínios e Derivados", label: "Laticínios e Derivados" },
  { value: "Lavoura", label: "Lavoura" },
  { value: "Lazer/Turismo", label: "Lazer/Turismo" },
  { value: "Mineração", label: "Mineração" },
  { value: "Pecuária", label: "Pecuária" },
  { value: "Projeto Imobiliário", label: "Projeto Imobiliário" },
  { value: "Usina", label: "Usina" },
  { value: "Vinícola", label: "Vinícola" },
] as const;

const CITY_ALL = "__all__";

function OptionsSelect({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={selectTriggerClass}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function HomeSearchFilters() {
  const [, setLocation] = useLocation();
  const [propertyType, setPropertyType] = useState("todos");
  const [aptitude, setAptitude] = useState("todos");
  const [intent, setIntent] = useState("todos");
  const [city, setCity] = useState(CITY_ALL);

  const [areaMinStr, setAreaMinStr] = useState("");
  const [areaMaxStr, setAreaMaxStr] = useState("");
  const [priceMinStr, setPriceMinStr] = useState("");
  const [priceMaxStr, setPriceMaxStr] = useState("");

  const cityOptions = [
    { value: CITY_ALL, label: "Todas as cidades" },
    ...MATO_GROSSO_DO_SUL_CITIES.map((c) => ({ value: c, label: c })),
  ];

  const handleSearch = async () => {
    const areaMin = parseAreaHectares(areaMinStr);
    const areaMax = parseAreaHectares(areaMaxStr);
    if (areaMinStr.trim() && areaMin === null) {
      toast({
        variant: "destructive",
        title: "Área inválida",
        description: "Use apenas números para hectares (ex.: 100 ou 150,5).",
      });
      return;
    }
    if (areaMaxStr.trim() && areaMax === null) {
      toast({
        variant: "destructive",
        title: "Área inválida",
        description: "Use apenas números para hectares (ex.: 100 ou 150,5).",
      });
      return;
    }
    if (areaMin != null && areaMax != null && areaMin > areaMax) {
      toast({
        variant: "destructive",
        title: "Área inconsistente",
        description: "A área mínima não pode ser maior que a máxima.",
      });
      return;
    }

    const priceMin = parseBRLToNumber(priceMinStr);
    const priceMax = parseBRLToNumber(priceMaxStr);
    if (priceMinStr.trim() && priceMin === null) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Use formato brasileiro: R$ 1.234.567,89",
      });
      return;
    }
    if (priceMaxStr.trim() && priceMax === null) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Use formato brasileiro: R$ 1.234.567,89",
      });
      return;
    }
    if (priceMin != null && priceMax != null && priceMin > priceMax) {
      toast({
        variant: "destructive",
        title: "Valores inconsistentes",
        description: "O valor mínimo não pode ser maior que o máximo.",
      });
      return;
    }

    const baseCheck: GetListingsParams = {
      page: 1,
      limit: 1,
      state: "MS",
    };
    if (city !== CITY_ALL) {
      const check = await getListings({ ...baseCheck, city });
      if (check.total === 0) {
        toast({
          variant: "destructive",
          title: "Nenhum imóvel nesta cidade",
          description: `Não há fazendas publicadas em ${city} no momento. Tente outra cidade ou “Todas as cidades”.`,
        });
        return;
      }
    }

    const params: GetListingsParams = {
      page: 1,
      limit: 12,
      sortBy: "featured",
      state: "MS",
    };
    if (city !== CITY_ALL) params.city = city;
    if (propertyType !== "todos") params.propertyType = propertyType;
    if (aptitude !== "todos") params.aptitude = aptitude;
    if (areaMin != null) params.minArea = areaMin;
    if (areaMax != null) params.maxArea = areaMax;
    if (priceMin != null) params.minPrice = priceMin;
    if (priceMax != null) params.maxPrice = priceMax;

    const qs = listingsParamsToSearch(params);
    try {
      if (qs) sessionStorage.setItem(LISTINGS_FILTER_SESSION_KEY, qs);
      else sessionStorage.removeItem(LISTINGS_FILTER_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setLocation("/imoveis");
  };

  const blurFormatMoney = (raw: string, setter: (s: string) => void) => {
    const n = parseBRLToNumber(raw);
    if (n !== null) setter(formatNumberToBRL(n));
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/40 bg-white/88 p-5 shadow-xl backdrop-blur-xl",
        "ring-1 ring-white/25",
        "space-y-5"
      )}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="filter-property-type" className="text-sm font-medium text-slate-700">
            Tipos de Propriedade
          </Label>
          <OptionsSelect
            id="filter-property-type"
            value={propertyType}
            onChange={setPropertyType}
            placeholder="Selecione"
            options={PROPERTY_TYPES}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-aptitude" className="text-sm font-medium text-slate-700">
            Aptidões
          </Label>
          <OptionsSelect
            id="filter-aptitude"
            value={aptitude}
            onChange={setAptitude}
            placeholder="Selecione"
            options={APTITUDES}
          />
        </div>
      </div>

      <div className="space-y-2">
        <RadioGroup
          value={intent}
          onValueChange={setIntent}
          className="flex flex-row flex-wrap gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="todos" id="intent-todos" />
            <Label htmlFor="intent-todos" className="cursor-pointer font-normal text-slate-700">
              Todos
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="comprar" id="intent-comprar" />
            <Label htmlFor="intent-comprar" className="cursor-pointer font-normal text-slate-700">
              Comprar
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="arrendar" id="intent-arrendar" />
            <Label htmlFor="intent-arrendar" className="cursor-pointer font-normal text-slate-700">
              Arrendar
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-location" className="text-sm font-medium text-slate-700">
          Localização
        </Label>
        <OptionsSelect
          id="filter-location"
          value={city}
          onChange={setCity}
          placeholder="Selecione"
          options={cityOptions}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="area-min" className="text-sm font-medium text-slate-700">
            Área mín. (ha)
          </Label>
          <Input
            id="area-min"
            inputMode="decimal"
            placeholder="ex.: 50"
            className="h-11 rounded-xl border-neutral-200/90 bg-white/95"
            value={areaMinStr}
            onChange={(e) => setAreaMinStr(sanitizeAreaInput(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area-max" className="text-sm font-medium text-slate-700">
            Área máx. (ha)
          </Label>
          <Input
            id="area-max"
            inputMode="decimal"
            placeholder="ex.: 500"
            className="h-11 rounded-xl border-neutral-200/90 bg-white/95"
            value={areaMaxStr}
            onChange={(e) => setAreaMaxStr(sanitizeAreaInput(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price-min" className="text-sm font-medium text-slate-700">
            Valor mínimo
          </Label>
          <Input
            id="price-min"
            inputMode="decimal"
            placeholder="R$ 0,00"
            className="h-11 rounded-xl border-neutral-200/90 bg-white/95"
            value={priceMinStr}
            onChange={(e) => setPriceMinStr(sanitizeMoneyInput(e.target.value))}
            onBlur={() => blurFormatMoney(priceMinStr, setPriceMinStr)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price-max" className="text-sm font-medium text-slate-700">
            Valor máximo
          </Label>
          <Input
            id="price-max"
            inputMode="decimal"
            placeholder="R$ 0,00"
            className="h-11 rounded-xl border-neutral-200/90 bg-white/95"
            value={priceMaxStr}
            onChange={(e) => setPriceMaxStr(sanitizeMoneyInput(e.target.value))}
            onBlur={() => blurFormatMoney(priceMaxStr, setPriceMaxStr)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-[#769363] text-base font-medium text-white shadow-md hover:bg-[#657a52]"
          onClick={() => void handleSearch()}
        >
          Buscar
        </Button>
        <Button
          type="button"
          variant="ghost"
          title="Busca mais detalhada — em breve"
          aria-label="Busca mais detalhada"
          className="h-12 w-12 shrink-0 rounded-xl border border-[#c5e8bc] bg-[#E8F9E1]/95 p-0 text-[#0f3d14] shadow-sm backdrop-blur-sm hover:bg-[#dcf5d2] hover:text-[#0f3d14]"
          onClick={() => {
            /* busca avançada */
          }}
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
