/**
 * Hardcoded catalog of icons a category can be given, grouped into themes.
 * Every icon carries a label and search keywords so the picker can find it
 * by what it means ("petrol"), not just by its lucide name ("fuel").
 *
 * Icon names are stored in the database, so never rename an existing entry.
 */
import type { Component } from "svelte";
import { m } from "#paraglide/messages.js";
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
  /** Display name in the active language. */
  readonly label: string;
  /** Stable group id, one of {@link iconGroups}; see {@link iconGroupLabel}. */
  group: IconGroup;
  /** Extra search terms in the active language. */
  readonly keywords: string[];
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

export type IconGroup = (typeof iconGroups)[number];

/** Display name of a group in the active language. */
export function iconGroupLabel(group: IconGroup): string {
  switch (group) {
    case "Food & drink":
      return m.categories_icon_group_food();
    case "Home & living":
      return m.categories_icon_group_home();
    case "Utilities":
      return m.categories_icon_group_utilities();
    case "Transport":
      return m.categories_icon_group_transport();
    case "Health & fitness":
      return m.categories_icon_group_health();
    case "Leisure & travel":
      return m.categories_icon_group_leisure();
    case "Shopping & personal":
      return m.categories_icon_group_shopping();
    case "Money & finance":
      return m.categories_icon_group_money();
    case "General":
      return m.categories_icon_group_general();
  }
}

/**
 * Labels and keywords are looked up lazily (getters) so they follow the
 * active language instead of the one at module load.
 */
const entry = (
  group: IconGroup,
  name: string,
  component: Component,
  label: () => string,
  keywords: () => string,
): CatalogIcon => ({
  name,
  component,
  group,
  get label() {
    return label();
  },
  get keywords() {
    return keywords().split(" ");
  },
});

export const iconCatalog: CatalogIcon[] = [
  entry(
    "Food & drink",
    "utensils",
    UtensilsIcon,
    () => m.categories_icon_utensils_label(),
    () => m.categories_icon_utensils_keywords(),
  ),
  entry(
    "Food & drink",
    "shopping-basket",
    ShoppingBasketIcon,
    () => m.categories_icon_shopping_basket_label(),
    () => m.categories_icon_shopping_basket_keywords(),
  ),
  entry(
    "Food & drink",
    "shopping-cart",
    ShoppingCartIcon,
    () => m.categories_icon_shopping_cart_label(),
    () => m.categories_icon_shopping_cart_keywords(),
  ),
  entry(
    "Food & drink",
    "coffee",
    CoffeeIcon,
    () => m.categories_icon_coffee_label(),
    () => m.categories_icon_coffee_keywords(),
  ),
  entry(
    "Food & drink",
    "beer",
    BeerIcon,
    () => m.categories_icon_beer_label(),
    () => m.categories_icon_beer_keywords(),
  ),
  entry(
    "Food & drink",
    "wine",
    WineIcon,
    () => m.categories_icon_wine_label(),
    () => m.categories_icon_wine_keywords(),
  ),
  entry(
    "Food & drink",
    "pizza",
    PizzaIcon,
    () => m.categories_icon_pizza_label(),
    () => m.categories_icon_pizza_keywords(),
  ),
  entry(
    "Food & drink",
    "sandwich",
    SandwichIcon,
    () => m.categories_icon_sandwich_label(),
    () => m.categories_icon_sandwich_keywords(),
  ),
  entry(
    "Food & drink",
    "apple",
    AppleIcon,
    () => m.categories_icon_apple_label(),
    () => m.categories_icon_apple_keywords(),
  ),
  entry(
    "Food & drink",
    "cookie",
    CookieIcon,
    () => m.categories_icon_cookie_label(),
    () => m.categories_icon_cookie_keywords(),
  ),
  entry(
    "Food & drink",
    "ice-cream-cone",
    IceCreamConeIcon,
    () => m.categories_icon_ice_cream_cone_label(),
    () => m.categories_icon_ice_cream_cone_keywords(),
  ),
  entry(
    "Food & drink",
    "croissant",
    CroissantIcon,
    () => m.categories_icon_croissant_label(),
    () => m.categories_icon_croissant_keywords(),
  ),
  entry(
    "Food & drink",
    "cake-slice",
    CakeSliceIcon,
    () => m.categories_icon_cake_slice_label(),
    () => m.categories_icon_cake_slice_keywords(),
  ),
  entry(
    "Food & drink",
    "soup",
    SoupIcon,
    () => m.categories_icon_soup_label(),
    () => m.categories_icon_soup_keywords(),
  ),
  entry(
    "Food & drink",
    "popcorn",
    PopcornIcon,
    () => m.categories_icon_popcorn_label(),
    () => m.categories_icon_popcorn_keywords(),
  ),
  entry(
    "Food & drink",
    "cooking-pot",
    CookingPotIcon,
    () => m.categories_icon_cooking_pot_label(),
    () => m.categories_icon_cooking_pot_keywords(),
  ),
  entry(
    "Home & living",
    "house",
    HouseIcon,
    () => m.categories_icon_house_label(),
    () => m.categories_icon_house_keywords(),
  ),
  entry(
    "Home & living",
    "sofa",
    SofaIcon,
    () => m.categories_icon_sofa_label(),
    () => m.categories_icon_sofa_keywords(),
  ),
  entry(
    "Home & living",
    "bed",
    BedIcon,
    () => m.categories_icon_bed_label(),
    () => m.categories_icon_bed_keywords(),
  ),
  entry(
    "Home & living",
    "bath",
    BathIcon,
    () => m.categories_icon_bath_label(),
    () => m.categories_icon_bath_keywords(),
  ),
  entry(
    "Home & living",
    "lamp",
    LampIcon,
    () => m.categories_icon_lamp_label(),
    () => m.categories_icon_lamp_keywords(),
  ),
  entry(
    "Home & living",
    "hammer",
    HammerIcon,
    () => m.categories_icon_hammer_label(),
    () => m.categories_icon_hammer_keywords(),
  ),
  entry(
    "Home & living",
    "wrench",
    WrenchIcon,
    () => m.categories_icon_wrench_label(),
    () => m.categories_icon_wrench_keywords(),
  ),
  entry(
    "Home & living",
    "paintbrush",
    PaintbrushIcon,
    () => m.categories_icon_paintbrush_label(),
    () => m.categories_icon_paintbrush_keywords(),
  ),
  entry(
    "Home & living",
    "key-round",
    KeyRoundIcon,
    () => m.categories_icon_key_round_label(),
    () => m.categories_icon_key_round_keywords(),
  ),
  entry(
    "Home & living",
    "trash-2",
    Trash2Icon,
    () => m.categories_icon_trash_2_label(),
    () => m.categories_icon_trash_2_keywords(),
  ),
  entry(
    "Home & living",
    "washing-machine",
    WashingMachineIcon,
    () => m.categories_icon_washing_machine_label(),
    () => m.categories_icon_washing_machine_keywords(),
  ),
  entry(
    "Home & living",
    "refrigerator",
    RefrigeratorIcon,
    () => m.categories_icon_refrigerator_label(),
    () => m.categories_icon_refrigerator_keywords(),
  ),
  entry(
    "Home & living",
    "armchair",
    ArmchairIcon,
    () => m.categories_icon_armchair_label(),
    () => m.categories_icon_armchair_keywords(),
  ),
  entry(
    "Home & living",
    "brush-cleaning",
    BrushCleaningIcon,
    () => m.categories_icon_brush_cleaning_label(),
    () => m.categories_icon_brush_cleaning_keywords(),
  ),
  entry(
    "Home & living",
    "flower-2",
    Flower2Icon,
    () => m.categories_icon_flower_2_label(),
    () => m.categories_icon_flower_2_keywords(),
  ),
  entry(
    "Home & living",
    "sprout",
    SproutIcon,
    () => m.categories_icon_sprout_label(),
    () => m.categories_icon_sprout_keywords(),
  ),
  entry(
    "Utilities",
    "zap",
    ZapIcon,
    () => m.categories_icon_zap_label(),
    () => m.categories_icon_zap_keywords(),
  ),
  entry(
    "Utilities",
    "flame",
    FlameIcon,
    () => m.categories_icon_flame_label(),
    () => m.categories_icon_flame_keywords(),
  ),
  entry(
    "Utilities",
    "droplet",
    DropletIcon,
    () => m.categories_icon_droplet_label(),
    () => m.categories_icon_droplet_keywords(),
  ),
  entry(
    "Utilities",
    "wifi",
    WifiIcon,
    () => m.categories_icon_wifi_label(),
    () => m.categories_icon_wifi_keywords(),
  ),
  entry(
    "Utilities",
    "smartphone",
    SmartphoneIcon,
    () => m.categories_icon_smartphone_label(),
    () => m.categories_icon_smartphone_keywords(),
  ),
  entry(
    "Utilities",
    "tv",
    TvIcon,
    () => m.categories_icon_tv_label(),
    () => m.categories_icon_tv_keywords(),
  ),
  entry(
    "Utilities",
    "thermometer",
    ThermometerIcon,
    () => m.categories_icon_thermometer_label(),
    () => m.categories_icon_thermometer_keywords(),
  ),
  entry(
    "Utilities",
    "plug",
    PlugIcon,
    () => m.categories_icon_plug_label(),
    () => m.categories_icon_plug_keywords(),
  ),
  entry(
    "Utilities",
    "lightbulb",
    LightbulbIcon,
    () => m.categories_icon_lightbulb_label(),
    () => m.categories_icon_lightbulb_keywords(),
  ),
  entry(
    "Utilities",
    "fan",
    FanIcon,
    () => m.categories_icon_fan_label(),
    () => m.categories_icon_fan_keywords(),
  ),
  entry(
    "Utilities",
    "receipt",
    ReceiptIcon,
    () => m.categories_icon_receipt_label(),
    () => m.categories_icon_receipt_keywords(),
  ),
  entry(
    "Utilities",
    "satellite-dish",
    SatelliteDishIcon,
    () => m.categories_icon_satellite_dish_label(),
    () => m.categories_icon_satellite_dish_keywords(),
  ),
  entry(
    "Transport",
    "car",
    CarIcon,
    () => m.categories_icon_car_label(),
    () => m.categories_icon_car_keywords(),
  ),
  entry(
    "Transport",
    "fuel",
    FuelIcon,
    () => m.categories_icon_fuel_label(),
    () => m.categories_icon_fuel_keywords(),
  ),
  entry(
    "Transport",
    "bus",
    BusIcon,
    () => m.categories_icon_bus_label(),
    () => m.categories_icon_bus_keywords(),
  ),
  entry(
    "Transport",
    "train-front",
    TrainFrontIcon,
    () => m.categories_icon_train_front_label(),
    () => m.categories_icon_train_front_keywords(),
  ),
  entry(
    "Transport",
    "tram-front",
    TramFrontIcon,
    () => m.categories_icon_tram_front_label(),
    () => m.categories_icon_tram_front_keywords(),
  ),
  entry(
    "Transport",
    "bike",
    BikeIcon,
    () => m.categories_icon_bike_label(),
    () => m.categories_icon_bike_keywords(),
  ),
  entry(
    "Transport",
    "plane",
    PlaneIcon,
    () => m.categories_icon_plane_label(),
    () => m.categories_icon_plane_keywords(),
  ),
  entry(
    "Transport",
    "ship",
    ShipIcon,
    () => m.categories_icon_ship_label(),
    () => m.categories_icon_ship_keywords(),
  ),
  entry(
    "Transport",
    "car-taxi-front",
    CarTaxiFrontIcon,
    () => m.categories_icon_car_taxi_front_label(),
    () => m.categories_icon_car_taxi_front_keywords(),
  ),
  entry(
    "Transport",
    "parking-meter",
    ParkingMeterIcon,
    () => m.categories_icon_parking_meter_label(),
    () => m.categories_icon_parking_meter_keywords(),
  ),
  entry(
    "Transport",
    "car-front",
    CarFrontIcon,
    () => m.categories_icon_car_front_label(),
    () => m.categories_icon_car_front_keywords(),
  ),
  entry(
    "Transport",
    "motorbike",
    MotorbikeIcon,
    () => m.categories_icon_motorbike_label(),
    () => m.categories_icon_motorbike_keywords(),
  ),
  entry(
    "Transport",
    "route",
    RouteIcon,
    () => m.categories_icon_route_label(),
    () => m.categories_icon_route_keywords(),
  ),
  entry(
    "Transport",
    "traffic-cone",
    TrafficConeIcon,
    () => m.categories_icon_traffic_cone_label(),
    () => m.categories_icon_traffic_cone_keywords(),
  ),
  entry(
    "Transport",
    "truck",
    TruckIcon,
    () => m.categories_icon_truck_label(),
    () => m.categories_icon_truck_keywords(),
  ),
  entry(
    "Health & fitness",
    "pill",
    PillIcon,
    () => m.categories_icon_pill_label(),
    () => m.categories_icon_pill_keywords(),
  ),
  entry(
    "Health & fitness",
    "stethoscope",
    StethoscopeIcon,
    () => m.categories_icon_stethoscope_label(),
    () => m.categories_icon_stethoscope_keywords(),
  ),
  entry(
    "Health & fitness",
    "heart-pulse",
    HeartPulseIcon,
    () => m.categories_icon_heart_pulse_label(),
    () => m.categories_icon_heart_pulse_keywords(),
  ),
  entry(
    "Health & fitness",
    "dumbbell",
    DumbbellIcon,
    () => m.categories_icon_dumbbell_label(),
    () => m.categories_icon_dumbbell_keywords(),
  ),
  entry(
    "Health & fitness",
    "activity",
    ActivityIcon,
    () => m.categories_icon_activity_label(),
    () => m.categories_icon_activity_keywords(),
  ),
  entry(
    "Health & fitness",
    "syringe",
    SyringeIcon,
    () => m.categories_icon_syringe_label(),
    () => m.categories_icon_syringe_keywords(),
  ),
  entry(
    "Health & fitness",
    "hospital",
    HospitalIcon,
    () => m.categories_icon_hospital_label(),
    () => m.categories_icon_hospital_keywords(),
  ),
  entry(
    "Health & fitness",
    "smile",
    SmileIcon,
    () => m.categories_icon_smile_label(),
    () => m.categories_icon_smile_keywords(),
  ),
  entry(
    "Health & fitness",
    "glasses",
    GlassesIcon,
    () => m.categories_icon_glasses_label(),
    () => m.categories_icon_glasses_keywords(),
  ),
  entry(
    "Health & fitness",
    "bandage",
    BandageIcon,
    () => m.categories_icon_bandage_label(),
    () => m.categories_icon_bandage_keywords(),
  ),
  entry(
    "Health & fitness",
    "brain",
    BrainIcon,
    () => m.categories_icon_brain_label(),
    () => m.categories_icon_brain_keywords(),
  ),
  entry(
    "Health & fitness",
    "hand-heart",
    HandHeartIcon,
    () => m.categories_icon_hand_heart_label(),
    () => m.categories_icon_hand_heart_keywords(),
  ),
  entry(
    "Health & fitness",
    "scissors",
    ScissorsIcon,
    () => m.categories_icon_scissors_label(),
    () => m.categories_icon_scissors_keywords(),
  ),
  entry(
    "Health & fitness",
    "sparkles",
    SparklesIcon,
    () => m.categories_icon_sparkles_label(),
    () => m.categories_icon_sparkles_keywords(),
  ),
  entry(
    "Leisure & travel",
    "film",
    FilmIcon,
    () => m.categories_icon_film_label(),
    () => m.categories_icon_film_keywords(),
  ),
  entry(
    "Leisure & travel",
    "clapperboard",
    ClapperboardIcon,
    () => m.categories_icon_clapperboard_label(),
    () => m.categories_icon_clapperboard_keywords(),
  ),
  entry(
    "Leisure & travel",
    "music",
    MusicIcon,
    () => m.categories_icon_music_label(),
    () => m.categories_icon_music_keywords(),
  ),
  entry(
    "Leisure & travel",
    "gamepad-2",
    Gamepad2Icon,
    () => m.categories_icon_gamepad_2_label(),
    () => m.categories_icon_gamepad_2_keywords(),
  ),
  entry(
    "Leisure & travel",
    "book-open",
    BookOpenIcon,
    () => m.categories_icon_book_open_label(),
    () => m.categories_icon_book_open_keywords(),
  ),
  entry(
    "Leisure & travel",
    "ticket",
    TicketIcon,
    () => m.categories_icon_ticket_label(),
    () => m.categories_icon_ticket_keywords(),
  ),
  entry(
    "Leisure & travel",
    "tent",
    TentIcon,
    () => m.categories_icon_tent_label(),
    () => m.categories_icon_tent_keywords(),
  ),
  entry(
    "Leisure & travel",
    "mountain",
    MountainIcon,
    () => m.categories_icon_mountain_label(),
    () => m.categories_icon_mountain_keywords(),
  ),
  entry(
    "Leisure & travel",
    "tree-palm",
    TreePalmIcon,
    () => m.categories_icon_tree_palm_label(),
    () => m.categories_icon_tree_palm_keywords(),
  ),
  entry(
    "Leisure & travel",
    "luggage",
    LuggageIcon,
    () => m.categories_icon_luggage_label(),
    () => m.categories_icon_luggage_keywords(),
  ),
  entry(
    "Leisure & travel",
    "map",
    MapIcon,
    () => m.categories_icon_map_label(),
    () => m.categories_icon_map_keywords(),
  ),
  entry(
    "Leisure & travel",
    "camera",
    CameraIcon,
    () => m.categories_icon_camera_label(),
    () => m.categories_icon_camera_keywords(),
  ),
  entry(
    "Leisure & travel",
    "guitar",
    GuitarIcon,
    () => m.categories_icon_guitar_label(),
    () => m.categories_icon_guitar_keywords(),
  ),
  entry(
    "Leisure & travel",
    "trophy",
    TrophyIcon,
    () => m.categories_icon_trophy_label(),
    () => m.categories_icon_trophy_keywords(),
  ),
  entry(
    "Leisure & travel",
    "dices",
    DicesIcon,
    () => m.categories_icon_dices_label(),
    () => m.categories_icon_dices_keywords(),
  ),
  entry(
    "Leisure & travel",
    "party-popper",
    PartyPopperIcon,
    () => m.categories_icon_party_popper_label(),
    () => m.categories_icon_party_popper_keywords(),
  ),
  entry(
    "Leisure & travel",
    "hotel",
    HotelIcon,
    () => m.categories_icon_hotel_label(),
    () => m.categories_icon_hotel_keywords(),
  ),
  entry(
    "Leisure & travel",
    "compass",
    CompassIcon,
    () => m.categories_icon_compass_label(),
    () => m.categories_icon_compass_keywords(),
  ),
  entry(
    "Shopping & personal",
    "shirt",
    ShirtIcon,
    () => m.categories_icon_shirt_label(),
    () => m.categories_icon_shirt_keywords(),
  ),
  entry(
    "Shopping & personal",
    "gift",
    GiftIcon,
    () => m.categories_icon_gift_label(),
    () => m.categories_icon_gift_keywords(),
  ),
  entry(
    "Shopping & personal",
    "shopping-bag",
    ShoppingBagIcon,
    () => m.categories_icon_shopping_bag_label(),
    () => m.categories_icon_shopping_bag_keywords(),
  ),
  entry(
    "Shopping & personal",
    "watch",
    WatchIcon,
    () => m.categories_icon_watch_label(),
    () => m.categories_icon_watch_keywords(),
  ),
  entry(
    "Shopping & personal",
    "gem",
    GemIcon,
    () => m.categories_icon_gem_label(),
    () => m.categories_icon_gem_keywords(),
  ),
  entry(
    "Shopping & personal",
    "laptop",
    LaptopIcon,
    () => m.categories_icon_laptop_label(),
    () => m.categories_icon_laptop_keywords(),
  ),
  entry(
    "Shopping & personal",
    "headphones",
    HeadphonesIcon,
    () => m.categories_icon_headphones_label(),
    () => m.categories_icon_headphones_keywords(),
  ),
  entry(
    "Shopping & personal",
    "package",
    PackageIcon,
    () => m.categories_icon_package_label(),
    () => m.categories_icon_package_keywords(),
  ),
  entry(
    "Shopping & personal",
    "store",
    StoreIcon,
    () => m.categories_icon_store_label(),
    () => m.categories_icon_store_keywords(),
  ),
  entry(
    "Shopping & personal",
    "baby",
    BabyIcon,
    () => m.categories_icon_baby_label(),
    () => m.categories_icon_baby_keywords(),
  ),
  entry(
    "Shopping & personal",
    "paw-print",
    PawPrintIcon,
    () => m.categories_icon_paw_print_label(),
    () => m.categories_icon_paw_print_keywords(),
  ),
  entry(
    "Shopping & personal",
    "dog",
    DogIcon,
    () => m.categories_icon_dog_label(),
    () => m.categories_icon_dog_keywords(),
  ),
  entry(
    "Shopping & personal",
    "cat",
    CatIcon,
    () => m.categories_icon_cat_label(),
    () => m.categories_icon_cat_keywords(),
  ),
  entry(
    "Shopping & personal",
    "graduation-cap",
    GraduationCapIcon,
    () => m.categories_icon_graduation_cap_label(),
    () => m.categories_icon_graduation_cap_keywords(),
  ),
  entry(
    "Shopping & personal",
    "backpack",
    BackpackIcon,
    () => m.categories_icon_backpack_label(),
    () => m.categories_icon_backpack_keywords(),
  ),
  entry(
    "Shopping & personal",
    "book",
    BookIcon,
    () => m.categories_icon_book_label(),
    () => m.categories_icon_book_keywords(),
  ),
  entry(
    "Shopping & personal",
    "pencil",
    PencilIcon,
    () => m.categories_icon_pencil_label(),
    () => m.categories_icon_pencil_keywords(),
  ),
  entry(
    "Money & finance",
    "banknote",
    BanknoteIcon,
    () => m.categories_icon_banknote_label(),
    () => m.categories_icon_banknote_keywords(),
  ),
  entry(
    "Money & finance",
    "wallet",
    WalletIcon,
    () => m.categories_icon_wallet_label(),
    () => m.categories_icon_wallet_keywords(),
  ),
  entry(
    "Money & finance",
    "piggy-bank",
    PiggyBankIcon,
    () => m.categories_icon_piggy_bank_label(),
    () => m.categories_icon_piggy_bank_keywords(),
  ),
  entry(
    "Money & finance",
    "landmark",
    LandmarkIcon,
    () => m.categories_icon_landmark_label(),
    () => m.categories_icon_landmark_keywords(),
  ),
  entry(
    "Money & finance",
    "credit-card",
    CreditCardIcon,
    () => m.categories_icon_credit_card_label(),
    () => m.categories_icon_credit_card_keywords(),
  ),
  entry(
    "Money & finance",
    "coins",
    CoinsIcon,
    () => m.categories_icon_coins_label(),
    () => m.categories_icon_coins_keywords(),
  ),
  entry(
    "Money & finance",
    "hand-coins",
    HandCoinsIcon,
    () => m.categories_icon_hand_coins_label(),
    () => m.categories_icon_hand_coins_keywords(),
  ),
  entry(
    "Money & finance",
    "trending-up",
    TrendingUpIcon,
    () => m.categories_icon_trending_up_label(),
    () => m.categories_icon_trending_up_keywords(),
  ),
  entry(
    "Money & finance",
    "chart-line",
    ChartLineIcon,
    () => m.categories_icon_chart_line_label(),
    () => m.categories_icon_chart_line_keywords(),
  ),
  entry(
    "Money & finance",
    "percent",
    PercentIcon,
    () => m.categories_icon_percent_label(),
    () => m.categories_icon_percent_keywords(),
  ),
  entry(
    "Money & finance",
    "scale",
    ScaleIcon,
    () => m.categories_icon_scale_label(),
    () => m.categories_icon_scale_keywords(),
  ),
  entry(
    "Money & finance",
    "shield-check",
    ShieldCheckIcon,
    () => m.categories_icon_shield_check_label(),
    () => m.categories_icon_shield_check_keywords(),
  ),
  entry(
    "Money & finance",
    "calculator",
    CalculatorIcon,
    () => m.categories_icon_calculator_label(),
    () => m.categories_icon_calculator_keywords(),
  ),
  entry(
    "Money & finance",
    "badge-dollar-sign",
    BadgeDollarSignIcon,
    () => m.categories_icon_badge_dollar_sign_label(),
    () => m.categories_icon_badge_dollar_sign_keywords(),
  ),
  entry(
    "Money & finance",
    "circle-dollar-sign",
    CircleDollarSignIcon,
    () => m.categories_icon_circle_dollar_sign_label(),
    () => m.categories_icon_circle_dollar_sign_keywords(),
  ),
  entry(
    "Money & finance",
    "receipt-text",
    ReceiptTextIcon,
    () => m.categories_icon_receipt_text_label(),
    () => m.categories_icon_receipt_text_keywords(),
  ),
  entry(
    "Money & finance",
    "handshake",
    HandshakeIcon,
    () => m.categories_icon_handshake_label(),
    () => m.categories_icon_handshake_keywords(),
  ),
  entry(
    "Money & finance",
    "briefcase",
    BriefcaseIcon,
    () => m.categories_icon_briefcase_label(),
    () => m.categories_icon_briefcase_keywords(),
  ),
  entry(
    "General",
    "tag",
    TagIcon,
    () => m.categories_icon_tag_label(),
    () => m.categories_icon_tag_keywords(),
  ),
  entry(
    "General",
    "star",
    StarIcon,
    () => m.categories_icon_star_label(),
    () => m.categories_icon_star_keywords(),
  ),
  entry(
    "General",
    "heart",
    HeartIcon,
    () => m.categories_icon_heart_label(),
    () => m.categories_icon_heart_keywords(),
  ),
  entry(
    "General",
    "circle-question-mark",
    CircleQuestionMarkIcon,
    () => m.categories_icon_circle_question_mark_label(),
    () => m.categories_icon_circle_question_mark_keywords(),
  ),
  entry(
    "General",
    "users",
    UsersIcon,
    () => m.categories_icon_users_label(),
    () => m.categories_icon_users_keywords(),
  ),
  entry(
    "General",
    "user",
    UserIcon,
    () => m.categories_icon_user_label(),
    () => m.categories_icon_user_keywords(),
  ),
  entry(
    "General",
    "calendar",
    CalendarIcon,
    () => m.categories_icon_calendar_label(),
    () => m.categories_icon_calendar_keywords(),
  ),
  entry(
    "General",
    "repeat",
    RepeatIcon,
    () => m.categories_icon_repeat_label(),
    () => m.categories_icon_repeat_keywords(),
  ),
  entry(
    "General",
    "bookmark",
    BookmarkIcon,
    () => m.categories_icon_bookmark_label(),
    () => m.categories_icon_bookmark_keywords(),
  ),
  entry(
    "General",
    "flag",
    FlagIcon,
    () => m.categories_icon_flag_label(),
    () => m.categories_icon_flag_keywords(),
  ),
  entry(
    "General",
    "target",
    TargetIcon,
    () => m.categories_icon_target_label(),
    () => m.categories_icon_target_keywords(),
  ),
  entry(
    "General",
    "globe",
    GlobeIcon,
    () => m.categories_icon_globe_label(),
    () => m.categories_icon_globe_keywords(),
  ),
  entry(
    "General",
    "mail",
    MailIcon,
    () => m.categories_icon_mail_label(),
    () => m.categories_icon_mail_keywords(),
  ),
  entry(
    "General",
    "phone",
    PhoneIcon,
    () => m.categories_icon_phone_label(),
    () => m.categories_icon_phone_keywords(),
  ),
  entry(
    "General",
    "sun",
    SunIcon,
    () => m.categories_icon_sun_label(),
    () => m.categories_icon_sun_keywords(),
  ),
  entry(
    "General",
    "snowflake",
    SnowflakeIcon,
    () => m.categories_icon_snowflake_label(),
    () => m.categories_icon_snowflake_keywords(),
  ),
  entry(
    "General",
    "leaf",
    LeafIcon,
    () => m.categories_icon_leaf_label(),
    () => m.categories_icon_leaf_keywords(),
  ),
  entry(
    "General",
    "cross",
    CrossIcon,
    () => m.categories_icon_cross_label(),
    () => m.categories_icon_cross_keywords(),
  ),
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
    const haystack = [i.label, i.name, iconGroupLabel(i.group), ...i.keywords]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
