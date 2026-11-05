/**
 * Hardcoded catalog of icons a category can be given, grouped into themes.
 * Every icon carries a label and search keywords so the picker can find it
 * by what it means ("petrol"), not just by its lucide name ("fuel").
 *
 * Icon names are stored in the database, so never rename an existing entry.
 */
import type { Component } from "svelte";
import UtensilsIcon from "@lucide/svelte/icons/utensils";
import ShoppingBasketIcon from "@lucide/svelte/icons/shopping-basket";
import ShoppingCartIcon from "@lucide/svelte/icons/shopping-cart";
import CoffeeIcon from "@lucide/svelte/icons/coffee";
import BeerIcon from "@lucide/svelte/icons/beer";
import WineIcon from "@lucide/svelte/icons/wine";
import PizzaIcon from "@lucide/svelte/icons/pizza";
import SandwichIcon from "@lucide/svelte/icons/sandwich";
import AppleIcon from "@lucide/svelte/icons/apple";
import CookieIcon from "@lucide/svelte/icons/cookie";
import IceCreamConeIcon from "@lucide/svelte/icons/ice-cream-cone";
import CroissantIcon from "@lucide/svelte/icons/croissant";
import CakeSliceIcon from "@lucide/svelte/icons/cake-slice";
import SoupIcon from "@lucide/svelte/icons/soup";
import PopcornIcon from "@lucide/svelte/icons/popcorn";
import CookingPotIcon from "@lucide/svelte/icons/cooking-pot";
import HouseIcon from "@lucide/svelte/icons/house";
import SofaIcon from "@lucide/svelte/icons/sofa";
import BedIcon from "@lucide/svelte/icons/bed";
import BathIcon from "@lucide/svelte/icons/bath";
import LampIcon from "@lucide/svelte/icons/lamp";
import HammerIcon from "@lucide/svelte/icons/hammer";
import WrenchIcon from "@lucide/svelte/icons/wrench";
import PaintbrushIcon from "@lucide/svelte/icons/paintbrush";
import KeyRoundIcon from "@lucide/svelte/icons/key-round";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import WashingMachineIcon from "@lucide/svelte/icons/washing-machine";
import RefrigeratorIcon from "@lucide/svelte/icons/refrigerator";
import ArmchairIcon from "@lucide/svelte/icons/armchair";
import BrushCleaningIcon from "@lucide/svelte/icons/brush-cleaning";
import Flower2Icon from "@lucide/svelte/icons/flower-2";
import SproutIcon from "@lucide/svelte/icons/sprout";
import ZapIcon from "@lucide/svelte/icons/zap";
import FlameIcon from "@lucide/svelte/icons/flame";
import DropletIcon from "@lucide/svelte/icons/droplet";
import WifiIcon from "@lucide/svelte/icons/wifi";
import SmartphoneIcon from "@lucide/svelte/icons/smartphone";
import TvIcon from "@lucide/svelte/icons/tv";
import ThermometerIcon from "@lucide/svelte/icons/thermometer";
import PlugIcon from "@lucide/svelte/icons/plug";
import LightbulbIcon from "@lucide/svelte/icons/lightbulb";
import FanIcon from "@lucide/svelte/icons/fan";
import ReceiptIcon from "@lucide/svelte/icons/receipt";
import SatelliteDishIcon from "@lucide/svelte/icons/satellite-dish";
import CarIcon from "@lucide/svelte/icons/car";
import FuelIcon from "@lucide/svelte/icons/fuel";
import BusIcon from "@lucide/svelte/icons/bus";
import TrainFrontIcon from "@lucide/svelte/icons/train-front";
import TramFrontIcon from "@lucide/svelte/icons/tram-front";
import BikeIcon from "@lucide/svelte/icons/bike";
import PlaneIcon from "@lucide/svelte/icons/plane";
import ShipIcon from "@lucide/svelte/icons/ship";
import CarTaxiFrontIcon from "@lucide/svelte/icons/car-taxi-front";
import ParkingMeterIcon from "@lucide/svelte/icons/parking-meter";
import CarFrontIcon from "@lucide/svelte/icons/car-front";
import MotorbikeIcon from "@lucide/svelte/icons/motorbike";
import RouteIcon from "@lucide/svelte/icons/route";
import TrafficConeIcon from "@lucide/svelte/icons/traffic-cone";
import TruckIcon from "@lucide/svelte/icons/truck";
import PillIcon from "@lucide/svelte/icons/pill";
import StethoscopeIcon from "@lucide/svelte/icons/stethoscope";
import HeartPulseIcon from "@lucide/svelte/icons/heart-pulse";
import DumbbellIcon from "@lucide/svelte/icons/dumbbell";
import ActivityIcon from "@lucide/svelte/icons/activity";
import SyringeIcon from "@lucide/svelte/icons/syringe";
import HospitalIcon from "@lucide/svelte/icons/hospital";
import SmileIcon from "@lucide/svelte/icons/smile";
import GlassesIcon from "@lucide/svelte/icons/glasses";
import BandageIcon from "@lucide/svelte/icons/bandage";
import BrainIcon from "@lucide/svelte/icons/brain";
import HandHeartIcon from "@lucide/svelte/icons/hand-heart";
import ScissorsIcon from "@lucide/svelte/icons/scissors";
import SparklesIcon from "@lucide/svelte/icons/sparkles";
import FilmIcon from "@lucide/svelte/icons/film";
import ClapperboardIcon from "@lucide/svelte/icons/clapperboard";
import MusicIcon from "@lucide/svelte/icons/music";
import Gamepad2Icon from "@lucide/svelte/icons/gamepad-2";
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import TicketIcon from "@lucide/svelte/icons/ticket";
import TentIcon from "@lucide/svelte/icons/tent";
import MountainIcon from "@lucide/svelte/icons/mountain";
import TreePalmIcon from "@lucide/svelte/icons/tree-palm";
import LuggageIcon from "@lucide/svelte/icons/luggage";
import MapIcon from "@lucide/svelte/icons/map";
import CameraIcon from "@lucide/svelte/icons/camera";
import GuitarIcon from "@lucide/svelte/icons/guitar";
import TrophyIcon from "@lucide/svelte/icons/trophy";
import DicesIcon from "@lucide/svelte/icons/dices";
import PartyPopperIcon from "@lucide/svelte/icons/party-popper";
import HotelIcon from "@lucide/svelte/icons/hotel";
import CompassIcon from "@lucide/svelte/icons/compass";
import ShirtIcon from "@lucide/svelte/icons/shirt";
import GiftIcon from "@lucide/svelte/icons/gift";
import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag";
import WatchIcon from "@lucide/svelte/icons/watch";
import GemIcon from "@lucide/svelte/icons/gem";
import LaptopIcon from "@lucide/svelte/icons/laptop";
import HeadphonesIcon from "@lucide/svelte/icons/headphones";
import PackageIcon from "@lucide/svelte/icons/package";
import StoreIcon from "@lucide/svelte/icons/store";
import BabyIcon from "@lucide/svelte/icons/baby";
import PawPrintIcon from "@lucide/svelte/icons/paw-print";
import DogIcon from "@lucide/svelte/icons/dog";
import CatIcon from "@lucide/svelte/icons/cat";
import GraduationCapIcon from "@lucide/svelte/icons/graduation-cap";
import BackpackIcon from "@lucide/svelte/icons/backpack";
import BookIcon from "@lucide/svelte/icons/book";
import PencilIcon from "@lucide/svelte/icons/pencil";
import BanknoteIcon from "@lucide/svelte/icons/banknote";
import WalletIcon from "@lucide/svelte/icons/wallet";
import PiggyBankIcon from "@lucide/svelte/icons/piggy-bank";
import LandmarkIcon from "@lucide/svelte/icons/landmark";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import CoinsIcon from "@lucide/svelte/icons/coins";
import HandCoinsIcon from "@lucide/svelte/icons/hand-coins";
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import ChartLineIcon from "@lucide/svelte/icons/chart-line";
import PercentIcon from "@lucide/svelte/icons/percent";
import ScaleIcon from "@lucide/svelte/icons/scale";
import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
import CalculatorIcon from "@lucide/svelte/icons/calculator";
import BadgeDollarSignIcon from "@lucide/svelte/icons/badge-dollar-sign";
import CircleDollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign";
import ReceiptTextIcon from "@lucide/svelte/icons/receipt-text";
import HandshakeIcon from "@lucide/svelte/icons/handshake";
import BriefcaseIcon from "@lucide/svelte/icons/briefcase";
import TagIcon from "@lucide/svelte/icons/tag";
import StarIcon from "@lucide/svelte/icons/star";
import HeartIcon from "@lucide/svelte/icons/heart";
import CircleQuestionMarkIcon from "@lucide/svelte/icons/circle-question-mark";
import UsersIcon from "@lucide/svelte/icons/users";
import UserIcon from "@lucide/svelte/icons/user";
import CalendarIcon from "@lucide/svelte/icons/calendar";
import RepeatIcon from "@lucide/svelte/icons/repeat";
import BookmarkIcon from "@lucide/svelte/icons/bookmark";
import FlagIcon from "@lucide/svelte/icons/flag";
import TargetIcon from "@lucide/svelte/icons/target";
import GlobeIcon from "@lucide/svelte/icons/globe";
import MailIcon from "@lucide/svelte/icons/mail";
import PhoneIcon from "@lucide/svelte/icons/phone";
import SunIcon from "@lucide/svelte/icons/sun";
import SnowflakeIcon from "@lucide/svelte/icons/snowflake";
import LeafIcon from "@lucide/svelte/icons/leaf";
import CrossIcon from "@lucide/svelte/icons/cross";

export interface CatalogIcon {
  /** Stable identifier stored on the category (lucide slug). */
  name: string;
  component: Component;
  /** Display name. */
  label: string;
  group: string;
  /** Extra search terms. */
  keywords: string[];
}

export const iconGroups = [
  "Food & drink",
  "Home & living",
  "Utilities",
  "Transport",
  "Health & fitness",
  "Leisure & travel",
  "Shopping & personal",
  "Money & finance",
  "General",
] as const;

const entry = (
  group: string,
  name: string,
  component: Component,
  label: string,
  keywords: string,
): CatalogIcon => ({
  name,
  component,
  label,
  group,
  keywords: keywords.split(" "),
});

export const iconCatalog: CatalogIcon[] = [
  entry(
    "Food & drink",
    "utensils",
    UtensilsIcon,
    "Dining out",
    "restaurant eat meal lunch dinner",
  ),
  entry(
    "Food & drink",
    "shopping-basket",
    ShoppingBasketIcon,
    "Groceries",
    "supermarket food shop basket",
  ),
  entry(
    "Food & drink",
    "shopping-cart",
    ShoppingCartIcon,
    "Shopping cart",
    "supermarket store buy",
  ),
  entry("Food & drink", "coffee", CoffeeIcon, "Coffee", "cafe tea drink"),
  entry("Food & drink", "beer", BeerIcon, "Beer", "pub bar alcohol drink"),
  entry("Food & drink", "wine", WineIcon, "Wine", "alcohol drink bottle"),
  entry("Food & drink", "pizza", PizzaIcon, "Pizza", "fast food takeaway"),
  entry(
    "Food & drink",
    "sandwich",
    SandwichIcon,
    "Sandwich",
    "lunch snack bakery",
  ),
  entry("Food & drink", "apple", AppleIcon, "Fruit", "healthy fresh groceries"),
  entry(
    "Food & drink",
    "cookie",
    CookieIcon,
    "Snacks",
    "sweets biscuit dessert",
  ),
  entry(
    "Food & drink",
    "ice-cream-cone",
    IceCreamConeIcon,
    "Ice cream",
    "dessert sweets treat",
  ),
  entry(
    "Food & drink",
    "croissant",
    CroissantIcon,
    "Bakery",
    "bread pastry breakfast",
  ),
  entry(
    "Food & drink",
    "cake-slice",
    CakeSliceIcon,
    "Cake",
    "dessert birthday sweets",
  ),
  entry("Food & drink", "soup", SoupIcon, "Soup", "meal lunch"),
  entry(
    "Food & drink",
    "popcorn",
    PopcornIcon,
    "Snacks & movies",
    "cinema popcorn treat",
  ),
  entry(
    "Food & drink",
    "cooking-pot",
    CookingPotIcon,
    "Cooking",
    "kitchen meal",
  ),
  entry("Home & living", "house", HouseIcon, "Home", "housing rent mortgage"),
  entry("Home & living", "sofa", SofaIcon, "Furniture", "living room couch"),
  entry("Home & living", "bed", BedIcon, "Bedroom", "sleep furniture"),
  entry("Home & living", "bath", BathIcon, "Bathroom", "hygiene bathtub"),
  entry("Home & living", "lamp", LampIcon, "Lighting", "lamp light decor"),
  entry(
    "Home & living",
    "hammer",
    HammerIcon,
    "Repairs",
    "tools diy maintenance",
  ),
  entry(
    "Home & living",
    "wrench",
    WrenchIcon,
    "Maintenance",
    "tools fix repair",
  ),
  entry(
    "Home & living",
    "paintbrush",
    PaintbrushIcon,
    "Decoration",
    "paint renovation diy",
  ),
  entry(
    "Home & living",
    "key-round",
    KeyRoundIcon,
    "Rent",
    "keys landlord lease",
  ),
  entry(
    "Home & living",
    "trash-2",
    Trash2Icon,
    "Waste",
    "garbage bin disposal",
  ),
  entry(
    "Home & living",
    "washing-machine",
    WashingMachineIcon,
    "Laundry",
    "appliance cleaning",
  ),
  entry(
    "Home & living",
    "refrigerator",
    RefrigeratorIcon,
    "Appliances",
    "kitchen fridge electronics",
  ),
  entry(
    "Home & living",
    "armchair",
    ArmchairIcon,
    "Armchair",
    "furniture seating",
  ),
  entry(
    "Home & living",
    "brush-cleaning",
    BrushCleaningIcon,
    "Cleaning",
    "supplies household",
  ),
  entry("Home & living", "flower-2", Flower2Icon, "Garden", "plants flowers"),
  entry("Home & living", "sprout", SproutIcon, "Plants", "garden growing"),
  entry("Utilities", "zap", ZapIcon, "Electricity", "energy power electric"),
  entry("Utilities", "flame", FlameIcon, "Gas", "heating energy fire"),
  entry("Utilities", "droplet", DropletIcon, "Water", "utility bill"),
  entry("Utilities", "wifi", WifiIcon, "Internet", "broadband router network"),
  entry(
    "Utilities",
    "smartphone",
    SmartphoneIcon,
    "Phone",
    "mobile cellular tariff",
  ),
  entry(
    "Utilities",
    "tv",
    TvIcon,
    "Television",
    "cable streaming subscription",
  ),
  entry(
    "Utilities",
    "thermometer",
    ThermometerIcon,
    "Heating",
    "temperature climate",
  ),
  entry("Utilities", "plug", PlugIcon, "Power", "electric outlet energy"),
  entry(
    "Utilities",
    "lightbulb",
    LightbulbIcon,
    "Light bulb",
    "energy idea electricity",
  ),
  entry("Utilities", "fan", FanIcon, "Cooling", "air conditioning ventilation"),
  entry(
    "Utilities",
    "receipt",
    ReceiptIcon,
    "Bills",
    "invoice utility payment",
  ),
  entry(
    "Utilities",
    "satellite-dish",
    SatelliteDishIcon,
    "Satellite",
    "tv signal",
  ),
  entry("Transport", "car", CarIcon, "Car", "vehicle auto"),
  entry("Transport", "fuel", FuelIcon, "Fuel", "petrol diesel gas station"),
  entry("Transport", "bus", BusIcon, "Bus", "public transport"),
  entry("Transport", "train-front", TrainFrontIcon, "Train", "rail commute"),
  entry(
    "Transport",
    "tram-front",
    TramFrontIcon,
    "Tram",
    "public transport city",
  ),
  entry("Transport", "bike", BikeIcon, "Bicycle", "cycling bike"),
  entry("Transport", "plane", PlaneIcon, "Flights", "travel airline airport"),
  entry("Transport", "ship", ShipIcon, "Ferry", "boat sea cruise"),
  entry(
    "Transport",
    "car-taxi-front",
    CarTaxiFrontIcon,
    "Taxi",
    "cab ride hail",
  ),
  entry(
    "Transport",
    "parking-meter",
    ParkingMeterIcon,
    "Parking",
    "car park fee",
  ),
  entry(
    "Transport",
    "car-front",
    CarFrontIcon,
    "Car service",
    "garage mechanic",
  ),
  entry(
    "Transport",
    "motorbike",
    MotorbikeIcon,
    "Motorbike",
    "motorcycle scooter",
  ),
  entry("Transport", "route", RouteIcon, "Tolls", "road highway toll vignette"),
  entry(
    "Transport",
    "traffic-cone",
    TrafficConeIcon,
    "Roadworks",
    "fines traffic",
  ),
  entry("Transport", "truck", TruckIcon, "Delivery", "shipping courier moving"),
  entry(
    "Health & fitness",
    "pill",
    PillIcon,
    "Medicine",
    "pharmacy drugs prescription",
  ),
  entry(
    "Health & fitness",
    "stethoscope",
    StethoscopeIcon,
    "Doctor",
    "medical checkup physician",
  ),
  entry(
    "Health & fitness",
    "heart-pulse",
    HeartPulseIcon,
    "Health",
    "wellness medical",
  ),
  entry(
    "Health & fitness",
    "dumbbell",
    DumbbellIcon,
    "Gym",
    "fitness workout training",
  ),
  entry(
    "Health & fitness",
    "activity",
    ActivityIcon,
    "Activity",
    "sport exercise",
  ),
  entry(
    "Health & fitness",
    "syringe",
    SyringeIcon,
    "Vaccination",
    "medical shot",
  ),
  entry(
    "Health & fitness",
    "hospital",
    HospitalIcon,
    "Hospital",
    "clinic emergency",
  ),
  entry("Health & fitness", "smile", SmileIcon, "Dentist", "teeth dental"),
  entry(
    "Health & fitness",
    "glasses",
    GlassesIcon,
    "Optician",
    "eyes vision glasses",
  ),
  entry(
    "Health & fitness",
    "bandage",
    BandageIcon,
    "First aid",
    "injury medical",
  ),
  entry(
    "Health & fitness",
    "brain",
    BrainIcon,
    "Mental health",
    "therapy psychology",
  ),
  entry(
    "Health & fitness",
    "hand-heart",
    HandHeartIcon,
    "Care",
    "charity wellbeing",
  ),
  entry(
    "Health & fitness",
    "scissors",
    ScissorsIcon,
    "Hairdresser",
    "haircut barber beauty",
  ),
  entry(
    "Health & fitness",
    "sparkles",
    SparklesIcon,
    "Beauty",
    "cosmetics spa care",
  ),
  entry("Leisure & travel", "film", FilmIcon, "Cinema", "movies theatre"),
  entry(
    "Leisure & travel",
    "clapperboard",
    ClapperboardIcon,
    "Streaming",
    "movies video subscription",
  ),
  entry(
    "Leisure & travel",
    "music",
    MusicIcon,
    "Music",
    "concerts spotify audio",
  ),
  entry(
    "Leisure & travel",
    "gamepad-2",
    Gamepad2Icon,
    "Gaming",
    "games console video",
  ),
  entry(
    "Leisure & travel",
    "book-open",
    BookOpenIcon,
    "Books",
    "reading library",
  ),
  entry(
    "Leisure & travel",
    "ticket",
    TicketIcon,
    "Tickets",
    "events concert entertainment",
  ),
  entry(
    "Leisure & travel",
    "tent",
    TentIcon,
    "Camping",
    "outdoor holiday nature",
  ),
  entry(
    "Leisure & travel",
    "mountain",
    MountainIcon,
    "Hiking",
    "outdoor travel nature",
  ),
  entry(
    "Leisure & travel",
    "tree-palm",
    TreePalmIcon,
    "Beach",
    "holiday vacation sea",
  ),
  entry(
    "Leisure & travel",
    "luggage",
    LuggageIcon,
    "Luggage",
    "trip baggage travel",
  ),
  entry("Leisure & travel", "map", MapIcon, "Trips", "travel sightseeing"),
  entry(
    "Leisure & travel",
    "camera",
    CameraIcon,
    "Photography",
    "camera hobby",
  ),
  entry("Leisure & travel", "guitar", GuitarIcon, "Instruments", "music hobby"),
  entry("Leisure & travel", "trophy", TrophyIcon, "Sports", "competition club"),
  entry("Leisure & travel", "dices", DicesIcon, "Games", "board games hobby"),
  entry(
    "Leisure & travel",
    "party-popper",
    PartyPopperIcon,
    "Party",
    "celebration event",
  ),
  entry(
    "Leisure & travel",
    "hotel",
    HotelIcon,
    "Hotel",
    "accommodation stay holiday",
  ),
  entry(
    "Leisure & travel",
    "compass",
    CompassIcon,
    "Adventure",
    "explore outdoors",
  ),
  entry(
    "Shopping & personal",
    "shirt",
    ShirtIcon,
    "Clothing",
    "clothes fashion apparel",
  ),
  entry(
    "Shopping & personal",
    "gift",
    GiftIcon,
    "Gifts",
    "presents birthday holiday",
  ),
  entry(
    "Shopping & personal",
    "shopping-bag",
    ShoppingBagIcon,
    "Shopping",
    "retail store purchase",
  ),
  entry(
    "Shopping & personal",
    "watch",
    WatchIcon,
    "Accessories",
    "jewelry watch fashion",
  ),
  entry("Shopping & personal", "gem", GemIcon, "Jewelry", "luxury ring"),
  entry(
    "Shopping & personal",
    "laptop",
    LaptopIcon,
    "Electronics",
    "computer gadgets tech",
  ),
  entry(
    "Shopping & personal",
    "headphones",
    HeadphonesIcon,
    "Audio",
    "music gadgets",
  ),
  entry(
    "Shopping & personal",
    "package",
    PackageIcon,
    "Parcels",
    "online orders delivery",
  ),
  entry("Shopping & personal", "store", StoreIcon, "Store", "shop retail"),
  entry("Shopping & personal", "baby", BabyIcon, "Baby", "kids child diapers"),
  entry(
    "Shopping & personal",
    "paw-print",
    PawPrintIcon,
    "Pets",
    "animals dog cat",
  ),
  entry("Shopping & personal", "dog", DogIcon, "Dog", "pet animal vet"),
  entry("Shopping & personal", "cat", CatIcon, "Cat", "pet animal vet"),
  entry(
    "Shopping & personal",
    "graduation-cap",
    GraduationCapIcon,
    "Education",
    "school university course tuition",
  ),
  entry(
    "Shopping & personal",
    "backpack",
    BackpackIcon,
    "School",
    "kids supplies",
  ),
  entry("Shopping & personal", "book", BookIcon, "Study", "education textbook"),
  entry(
    "Shopping & personal",
    "pencil",
    PencilIcon,
    "Stationery",
    "office supplies",
  ),
  entry(
    "Money & finance",
    "banknote",
    BanknoteIcon,
    "Income",
    "salary cash wages",
  ),
  entry("Money & finance", "wallet", WalletIcon, "Wallet", "cash pocket money"),
  entry(
    "Money & finance",
    "piggy-bank",
    PiggyBankIcon,
    "Savings",
    "deposit save reserve",
  ),
  entry(
    "Money & finance",
    "landmark",
    LandmarkIcon,
    "Bank",
    "fees institution",
  ),
  entry(
    "Money & finance",
    "credit-card",
    CreditCardIcon,
    "Card",
    "payment debit credit",
  ),
  entry("Money & finance", "coins", CoinsIcon, "Coins", "change cash"),
  entry(
    "Money & finance",
    "hand-coins",
    HandCoinsIcon,
    "Payments",
    "paying lending",
  ),
  entry(
    "Money & finance",
    "trending-up",
    TrendingUpIcon,
    "Investments",
    "stocks returns growth",
  ),
  entry(
    "Money & finance",
    "chart-line",
    ChartLineIcon,
    "Portfolio",
    "stocks etf market",
  ),
  entry(
    "Money & finance",
    "percent",
    PercentIcon,
    "Interest",
    "tax discount rate",
  ),
  entry("Money & finance", "scale", ScaleIcon, "Legal", "lawyer court fees"),
  entry(
    "Money & finance",
    "shield-check",
    ShieldCheckIcon,
    "Insurance",
    "protection policy",
  ),
  entry(
    "Money & finance",
    "calculator",
    CalculatorIcon,
    "Taxes",
    "accounting budget",
  ),
  entry(
    "Money & finance",
    "badge-dollar-sign",
    BadgeDollarSignIcon,
    "Dollar",
    "currency exchange",
  ),
  entry(
    "Money & finance",
    "circle-dollar-sign",
    CircleDollarSignIcon,
    "Currency",
    "money exchange",
  ),
  entry(
    "Money & finance",
    "receipt-text",
    ReceiptTextIcon,
    "Invoices",
    "bills accounting",
  ),
  entry(
    "Money & finance",
    "handshake",
    HandshakeIcon,
    "Business",
    "deal contract",
  ),
  entry(
    "Money & finance",
    "briefcase",
    BriefcaseIcon,
    "Work",
    "office job business",
  ),
  entry("General", "tag", TagIcon, "Tag", "label miscellaneous other"),
  entry("General", "star", StarIcon, "Favorite", "important star"),
  entry("General", "heart", HeartIcon, "Heart", "love favorite charity"),
  entry(
    "General",
    "circle-question-mark",
    CircleQuestionMarkIcon,
    "Other",
    "unknown misc",
  ),
  entry("General", "users", UsersIcon, "Family", "people household"),
  entry("General", "user", UserIcon, "Personal", "me individual"),
  entry("General", "calendar", CalendarIcon, "Calendar", "recurring monthly"),
  entry(
    "General",
    "repeat",
    RepeatIcon,
    "Subscriptions",
    "recurring regular membership",
  ),
  entry("General", "bookmark", BookmarkIcon, "Bookmark", "saved"),
  entry("General", "flag", FlagIcon, "Goals", "target milestone"),
  entry("General", "target", TargetIcon, "Target", "goal aim"),
  entry("General", "globe", GlobeIcon, "Global", "world international"),
  entry("General", "mail", MailIcon, "Post", "letters mail"),
  entry("General", "phone", PhoneIcon, "Call", "telephone"),
  entry("General", "sun", SunIcon, "Summer", "weather season"),
  entry("General", "snowflake", SnowflakeIcon, "Winter", "weather season ski"),
  entry("General", "leaf", LeafIcon, "Nature", "eco green"),
  entry("General", "cross", CrossIcon, "Church", "donation religion charity"),
];

const byName = new Map(iconCatalog.map((i) => [i.name, i]));

export function findIcon(name: string | null): CatalogIcon | undefined {
  return name ? byName.get(name.toLowerCase()) : undefined;
}

/** Case-insensitive match on label, name, group and keywords; all terms must match. */
export function searchIcons(query: string): CatalogIcon[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return iconCatalog;
  return iconCatalog.filter((i) => {
    const haystack = [i.label, i.name, i.group, ...i.keywords]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
