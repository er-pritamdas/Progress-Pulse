import React, { useEffect } from "react";
import {
  X,
  Info,
  Sparkles,
  Utensils,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Apple,
  Zap,
  BookOpen,
} from "lucide-react";

export const NUTRIENT_WIKI_DATA = {
  calories: {
    title: "Calories (Energy)",
    category: "Macronutrient / Energy",
    whatItIs: "A unit of measurement for energy provided by food and beverages to fuel bodily functions.",
    healthBenefits: [
      "Powers vital organs, brain function, and cellular respiration",
      "Fuels physical movement, exercise performance, and thermoregulation",
      "Maintains basal metabolic rate (BMR) required for survival",
    ],
    topFoodSources: ["Whole Grains", "Nuts & Seeds", "Avocados", "Lean Meats", "Dairy", "Legumes"],
    dailyRecommendation: "Typically 2,000 kcal for adults (varies by age, gender, and activity level).",
    deficiencySigns: "Chronic fatigue, unwanted weight loss, muscle wasting, brain fog, and hormone disruption.",
    funFact: "1 calorie represents the energy required to raise the temperature of 1 gram of water by 1°C!",
  },
  protein: {
    title: "Protein",
    category: "Essential Macronutrient",
    whatItIs: "Large, complex molecules made of amino acids essential for building and repairing body tissues.",
    healthBenefits: [
      "Builds and repairs muscle tissue, skin, enzymes, and hormones",
      "Promotes satiety and helps regulate appetite hormones",
      "Supports strong immune antibodies and cellular structure",
    ],
    topFoodSources: ["Chicken Breast", "Eggs", "Greek Yogurt", "Tofu & Edamame", "Lentils", "Salmon"],
    dailyRecommendation: "0.8g to 2.2g per kg of body weight (higher for active individuals and muscle growth).",
    deficiencySigns: "Loss of muscle mass, slow wound healing, hair thinning, edema, and frequent infections.",
    funFact: "Your body uses 20 different amino acids to form thousands of different proteins!",
  },
  carbohydrates: {
    title: "Carbohydrates",
    category: "Macronutrient",
    whatItIs: "The body's primary and preferred source of quick, digestible energy.",
    healthBenefits: [
      "Primary fuel source for the central nervous system and brain",
      "Sparing dietary protein from being burned for energy",
      "Provides digestive fiber to support gut microbiome health",
    ],
    topFoodSources: ["Oats & Quinoa", "Sweet Potatoes", "Bananas", "Brown Rice", "Berries", "Beans"],
    dailyRecommendation: "45% to 65% of total daily caloric intake.",
    deficiencySigns: "Ketosis, low energy, irritability, hypoglycemia, and exercise fatigue.",
    funFact: "The human brain relies almost exclusively on glucose (carbs) for its daily energy needs!",
  },
  netCarbs: {
    title: "Net Carbohydrates",
    category: "Macronutrient Metric",
    whatItIs: "Total carbohydrates minus dietary fiber and sugar alcohols, representing digestible carbs that impact blood glucose.",
    healthBenefits: [
      "Crucial metric for blood sugar control and diabetic management",
      "Helps maintain steady insulin levels and sustained energy",
      "Key indicator used in ketogenic and low-glycemic diets",
    ],
    topFoodSources: ["Leafy Greens", "Cruciferous Vegetables", "Nuts", "Berries", "Seeds"],
    dailyRecommendation: "Varies depending on personal diet goals (e.g. <50g for Keto, 100g–150g for low-carb).",
    deficiencySigns: "N/A — Net carbs are a calculation metric rather than an isolated nutrient.",
    funFact: "Dietary fiber does not raise blood sugar because human digestive enzymes cannot break it down into glucose!",
  },
  fat: {
    title: "Dietary Fat",
    category: "Essential Macronutrient",
    whatItIs: "A concentrated energy source vital for absorbing fat-soluble vitamins and protecting vital organs.",
    healthBenefits: [
      "Essential for absorbing Vitamins A, D, E, and K",
      "Supports hormone synthesis (testosterone, estrogen, progesterone)",
      "Forms the structural phospholipid outer membrane of all cells",
    ],
    topFoodSources: ["Extra Virgin Olive Oil", "Avocados", "Almonds & Walnuts", "Chia Seeds", "Fatty Fish"],
    dailyRecommendation: "20% to 35% of daily calories.",
    deficiencySigns: "Dry flaky skin, hair loss, vitamin deficiencies, and hormone imbalances.",
    funFact: "Your brain is made of approximately 60% fat!",
  },
  fiber: {
    title: "Dietary Fiber",
    category: "Indigestible Carbohydrate",
    whatItIs: "Plant-derived carbohydrates that pass through the digestive system largely intact.",
    healthBenefits: [
      "Normalizes bowel movements and prevents constipation",
      "Feeds beneficial gut bacteria to strengthen immunity",
      "Lowers LDL cholesterol and slows blood sugar spikes",
    ],
    topFoodSources: ["Chia Seeds", "Flaxseeds", "Lentils & Chickpeas", "Raspberries", "Oat Bran", "Apples"],
    dailyRecommendation: "25g per day for women, 38g per day for men.",
    deficiencySigns: "Constipation, irregular digestion, blood sugar spikes, and elevated cholesterol.",
    funFact: "Soluble fiber turns into a gel-like substance in your gut that slows down sugar absorption!",
  },
  sugar: {
    title: "Total Sugars",
    category: "Simple Carbohydrate",
    whatItIs: "Simple monosaccharides and disaccharides found naturally in foods or added during processing.",
    healthBenefits: [
      "Provides rapid, immediate energy during high-intensity exercise",
      "Natural fruit sugars come packaged with vital antioxidants and fiber",
    ],
    topFoodSources: ["Fresh Fruits", "Dairy Products", "Honey", "Maple Syrup", "Dried Fruits"],
    dailyRecommendation: "Limit added sugars to under 25g (women) or 36g (men) per day.",
    deficiencySigns: "None — simple sugars are not essential as the body can synthesize glucose.",
    funFact: "Natural fruit sugar (fructose) is processed by the liver, avoiding direct blood insulin spikes!",
  },
  vitaminA: {
    title: "Vitamin A",
    category: "Fat-Soluble Vitamin",
    whatItIs: "An essential vitamin crucial for vision, immune response, and cellular growth.",
    healthBenefits: [
      "Protects night vision and preserves corneal health",
      "Stimulates white blood cell production for immune defense",
      "Promotes skin cell turnover and healthy tissue lining",
    ],
    topFoodSources: ["Carrots", "Sweet Potatoes", "Spinach & Kale", "Beef Liver", "Eggs"],
    dailyRecommendation: "700 mcg RAE (women), 900 mcg RAE (men).",
    deficiencySigns: "Night blindness, dry eyes, frequent skin infections, and impaired growth.",
    funFact: "Beta-carotene gives carrots, pumpkin, and sweet potatoes their vivid orange color!",
  },
  vitaminC: {
    title: "Vitamin C (Ascorbic Acid)",
    category: "Water-Soluble Vitamin",
    whatItIs: "A powerful antioxidant essential for collagen synthesis, iron absorption, and immunity.",
    healthBenefits: [
      "Synthesizes collagen for skin, joint, and blood vessel health",
      "Neutralizes harmful free radicals and oxidative stress",
      "Enhances non-heme iron absorption from plant foods by up to 300%",
    ],
    topFoodSources: ["Bell Peppers", "Citrus Fruits (Oranges/Lemons)", "Strawberries", "Kiwi", "Broccoli"],
    dailyRecommendation: "75 mg (women), 90 mg (men).",
    deficiencySigns: "Scurvy, bleeding gums, slow wound healing, joint pain, and easy bruising.",
    funFact: "Unlike most animals, human bodies cannot produce Vitamin C and must obtain it daily from food!",
  },
  vitaminD: {
    title: "Vitamin D (Sunshine Vitamin)",
    category: "Fat-Soluble Hormone / Vitamin",
    whatItIs: "A nutrient synthesized when sunlight hits skin, crucial for calcium absorption and bone density.",
    healthBenefits: [
      "Regulates calcium & phosphorus for bone strength",
      "Modulates immune system defense against pathogens",
      "Supports mood regulation and neuromuscular function",
    ],
    topFoodSources: ["Sunlight Exposure", "Fatty Fish (Salmon, Mackerel)", "Egg Yolks", "Fortified Milk"],
    dailyRecommendation: "600 IU to 2,000 IU daily.",
    deficiencySigns: "Bone pain, muscle weakness, rickets in children, osteoporosis, and depression.",
    funFact: "Vitamin D acts more like a hormone in your body than a traditional vitamin!",
  },
  iron: {
    title: "Iron",
    category: "Essential Mineral",
    whatItIs: "A mineral necessary for hemoglobin production, transporting oxygen from lungs throughout the body.",
    healthBenefits: [
      "Forms hemoglobin in red blood cells for oxygen transport",
      "Prevents physical fatigue and supports brain concentration",
      "Essential for cellular energy production (ATP)",
    ],
    topFoodSources: ["Red Meat", "Spinach & Chard", "Lentils & Beans", "Dark Chocolate", "Pumpkin Seeds"],
    dailyRecommendation: "8 mg (men & postmenopausal women), 18 mg (premenopausal women).",
    deficiencySigns: "Anemia, extreme fatigue, pale skin, cold hands/feet, shortness of breath.",
    funFact: "Cast iron cookware can actually increase the iron content of acidic foods cooked in it!",
  },
  calcium: {
    title: "Calcium",
    category: "Essential Major Mineral",
    whatItIs: "The most abundant mineral in the human body, vital for strong bones, teeth, and cardiovascular function.",
    healthBenefits: [
      "Builds and maintains skeletal bone density and tooth enamel",
      "Enables skeletal muscle contraction and nerve signal transmission",
      "Regulates blood clotting, vascular tone, and cardiac muscle rhythm",
    ],
    topFoodSources: ["Dairy (Milk/Yogurt/Cheese)", "Sardines & Canned Salmon", "Tofu", "Leafy Greens (Kale/Bok Choy)", "Chia Seeds"],
    dailyRecommendation: "1,000 mg per day for adults (1,200 mg for women > 50 and adults > 70).",
    deficiencySigns: "Osteopenia, muscle cramps, brittle nails, numbness in fingers, and increased fracture risk.",
    funFact: "About 99% of your body's total calcium supply is stored directly in your bones and teeth!",
  },
  magnesium: {
    title: "Magnesium",
    category: "Essential Mineral & Electrolyte",
    whatItIs: "A critical macrominerals involved in over 300 enzymatic reactions in human physiology.",
    healthBenefits: [
      "Supports nerve signal transmission, muscle relaxation, and cramping prevention",
      "Crucial for cellular energy (ATP) production and protein synthesis",
      "Helps regulate blood glucose levels and promotes calm, restful sleep",
    ],
    topFoodSources: ["Pumpkin Seeds", "Spinach", "Almonds & Cashews", "Dark Chocolate (70%+)", "Black Beans"],
    dailyRecommendation: "310–320 mg (women), 400–420 mg (men).",
    deficiencySigns: "Muscle twitches/cramps, mental numbness, fatigue, high blood pressure, and irregular heartbeat.",
    funFact: "Chlorophyll gives green plants their color, and every single molecule of chlorophyll contains a magnesium atom at its core!",
  },
  phosphorus: {
    title: "Phosphorus",
    category: "Essential Major Mineral",
    whatItIs: "The second most abundant mineral in the body, working alongside calcium to build strong bone structure.",
    healthBenefits: [
      "Forms hydroxyapatite crystals with calcium to give structure to bones and teeth",
      "Integral component of ATP (adenosine triphosphate), the cellular energy currency",
      "Forms the structural backbone of human DNA and RNA molecules",
    ],
    topFoodSources: ["Chicken Breast", "Salmon & Tuna", "Milk & Cheese", "Pumpkin Seeds", "Lentils"],
    dailyRecommendation: "700 mg per day for adults.",
    deficiencySigns: "Loss of appetite, bone pain, muscle weakness, and fragile teeth.",
    funFact: "Phosphorus accounts for roughly 1% of a person's total body weight!",
  },
  potassium: {
    title: "Potassium",
    category: "Essential Mineral & Electrolyte",
    whatItIs: "A vital intracellular electrolyte responsible for maintaining cell fluid balance and nerve impulses.",
    healthBenefits: [
      "Counteracts excess sodium to maintain healthy blood pressure levels",
      "Powers heart rhythm and prevents arterial stiffness",
      "Prevents painful muscle cramps and supports nerve cell signaling",
    ],
    topFoodSources: ["Potatoes & Sweet Potatoes", "Bananas", "Avocados", "Spinach", "White Beans", "Coconut Water"],
    dailyRecommendation: "2,600 mg (women), 3,400 mg (men).",
    deficiencySigns: "Muscle weakness, extreme fatigue, constipation, heart palpitations, and high blood pressure.",
    funFact: "A medium baked potato with skin contains over 900 mg of potassium—almost double that of a banana!",
  },
  sodium: {
    title: "Sodium",
    category: "Essential Electrolyte",
    whatItIs: "An essential extracellular electrolyte critical for fluid balance, nerve conduction, and muscle contraction.",
    healthBenefits: [
      "Regulates extracellular fluid volume and blood plasma pressure",
      "Powers the sodium-potassium pump needed for cellular nerve impulses",
      "Facilitates nutrient absorption (like glucose and amino acids) in the intestines",
    ],
    topFoodSources: ["Sea Salt", "Pickles & Olives", "Broths", "Cheeses", "Cured Meats"],
    dailyRecommendation: "Keep intake under 2,300 mg per day (ideally ~1,500 mg for optimal blood pressure).",
    deficiencySigns: "Hyponatremia, muscle cramps, headache, nausea, confusion, and dizziness.",
    funFact: "Sodium works in tandem with potassium like a biological battery to generate electrical charges in your heart and brain!",
  },
  zinc: {
    title: "Zinc",
    category: "Essential Trace Mineral",
    whatItIs: "A trace mineral involved in over 300 enzymatic reactions in the human body.",
    healthBenefits: [
      "Accelerates wound healing and skin tissue repair",
      "Boosts immune T-cell function and fights viruses",
      "Supports DNA synthesis, taste, and smell perception",
    ],
    topFoodSources: ["Oysters & Shellfish", "Pumpkin Seeds", "Beef & Lamb", "Chickpeas", "Cashews"],
    dailyRecommendation: "8 mg (women), 11 mg (men).",
    deficiencySigns: "Loss of taste/smell, slow wound healing, hair loss, impaired immunity.",
    funFact: "Oysters contain more zinc per serving than any other food on Earth!",
  },
  omega3: {
    title: "Omega-3 Fatty Acids (EPA & DHA)",
    category: "Essential Polyunsaturated",
    whatItIs: "Healthy fats that reduce systemic inflammation and support cardiovascular and cognitive health.",
    healthBenefits: [
      "Reduces blood triglycerides and supports heart health",
      "Lowers chronic systemic inflammation across joints and organs",
      "Enhances memory, cognitive focus, and brain cell structure",
    ],
    topFoodSources: ["Wild Salmon", "Sardines", "Walnuts", "Chia Seeds", "Flaxseeds"],
    dailyRecommendation: "1.1g (women), 1.6g (men) of ALA; 250–500mg combined EPA/DHA.",
    deficiencySigns: "Dry skin, joint stiffness, poor memory, depression, and eye fatigue.",
    funFact: "DHA makes up over 90% of the omega-3 fats in your brain!",
  },
  water: {
    title: "Water (Hydration)",
    category: "Essential Fluid",
    whatItIs: "The fundamental liquid component powering all human cellular life and metabolism.",
    healthBenefits: [
      "Flushes out cellular toxins and metabolic waste via kidneys",
      "Lubricates joints and cushions vital organs",
      "Regulates internal body temperature through sweating",
    ],
    topFoodSources: ["Pure Water", "Cucumbers", "Watermelon", "Celery", "Oranges", "Herbal Tea"],
    dailyRecommendation: "2.7 Liters (women), 3.7 Liters (men) total fluid intake daily.",
    deficiencySigns: "Dehydration, dark urine, headaches, dizziness, dry mouth, and fatigue.",
    funFact: "A human can live for weeks without food, but only 3–5 days without water!",
  },
};

const getDefaultWikiInfo = (nutrient) => {
  return {
    title: nutrient.label || "Nutrient",
    category: "",
    whatItIs: `${nutrient.label} is an essential nutritional component that plays an important role in overall human health, metabolism, and wellness.`,
    healthBenefits: [
      `Supports daily metabolic balance and energy regulation`,
      `Contributes to proper organ function and physiological homeostasis`,
      `Helps maintain optimal physical vitality and daily wellness`,
    ],
    topFoodSources: ["Whole Foods", "Fresh Vegetables", "Nuts & Seeds", "Lean Proteins", "Fruits"],
    dailyRecommendation: `Follow standard daily reference values for ${nutrient.unit || "intake"}.`,
    deficiencySigns: `Consistently low levels may lead to fatigue or compromised bodily functions.`,
    funFact: `Consuming a balanced, whole-food diet helps ensure optimal absorption of ${nutrient.label}!`,
  };
};

function NutrientWikiModal({ isOpen, onClose, nutrient }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !nutrient) return null;

  const wiki = NUTRIENT_WIKI_DATA[nutrient.id] || getDefaultWikiInfo(nutrient);
  const Icon = nutrient.icon || Sparkles;

  return (
    <div className="fixed inset-0 z-[100001] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-200 rounded-3xl max-w-3xl w-full h-[640px] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 bg-base-100 rounded-xl border border-base-300 shadow-xs ${nutrient.color || "text-primary"}`}>
              <Icon size={20} />
            </div>
            <div>
              {wiki.category && (
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase tracking-wider">
                    {wiki.category}
                  </span>
                </div>
              )}
              <h2 className="text-base sm:text-lg font-bold text-base-content leading-tight mt-0.5">{wiki.title}</h2>
            </div>
          </div>

          <button
            className="btn btn-xs btn-circle btn-ghost"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Wiki Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0 text-xs sm:text-sm">
          {/* What it is */}
          <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs space-y-1.5">
            <div className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
              <BookOpen size={14} /> What Is It?
            </div>
            <p className="text-base-content/80 leading-relaxed">{wiki.whatItIs}</p>
          </div>

          {/* Health Benefits */}
          <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-success flex items-center gap-1.5">
              <HeartPulse size={14} /> Health Benefits & Role in Body
            </div>
            <ul className="space-y-2">
              {wiki.healthBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-base-content/85">
                  <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Food Sources */}
          <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs space-y-2.5">
            <div className="font-bold text-xs uppercase tracking-wider text-warning flex items-center gap-1.5">
              <Utensils size={14} /> Top Dietary Food Sources
            </div>
            <div className="flex flex-wrap gap-2">
              {wiki.topFoodSources.map((source, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-base-200 border border-base-300 font-semibold text-xs text-base-content/80 flex items-center gap-1.5 shadow-2xs"
                >
                  <Apple size={13} className="text-warning" /> {source}
                </span>
              ))}
            </div>
          </div>

          {/* Daily Target & Deficiency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-info flex items-center gap-1.5">
                <ShieldCheck size={14} /> Daily Target Guideline
              </div>
              <p className="text-base-content/80 text-xs">{wiki.dailyRecommendation}</p>
            </div>

            <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-error flex items-center gap-1.5">
                <AlertCircle size={14} /> Low Intake / Deficiency Signs
              </div>
              <p className="text-base-content/80 text-xs">{wiki.deficiencySigns}</p>
            </div>
          </div>

          {/* Fun Fact */}
          {wiki.funFact && (
            <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-2xl flex items-start gap-3">
              <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-primary">Did You Know?</span>
                <p className="text-xs text-base-content/80 mt-0.5 italic">{wiki.funFact}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-300/80 border-t border-base-300 flex justify-end shrink-0">
          <button className="btn btn-sm btn-primary rounded-xl px-6" onClick={onClose}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}

export default NutrientWikiModal;
