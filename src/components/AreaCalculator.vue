<template>
  <div class="calculator">
    <h2 data-translate-key="calculatorTitle">{{ t('calculatorTitle') }}</h2>

    <!-- Language Selector -->
    <div class="language-selector">
      <label for="lang-select">{{ t('selectLanguage') }}: </label>
      <select id="lang-select" v-model="locale"> <!-- Bind directly to i18n locale -->
        <option value="en">English</option>
        <option value="hi">हिन्दी (Hindi)</option>
      </select>
    </div>

    <!-- Calculation Mode Selector -->
    <div class="mode-selector">
      <label>
        <input type="radio" value="2d" v-model="calculationMode"> {{ t('mode2d') }}
      </label>
      <label>
        <input type="radio" value="3d" v-model="calculationMode"> {{ t('mode3d') }}
      </label>
    </div>

    <!-- Input Section -->
    <div class="input-group">
      <label>{{ t('length') }}</label>
      <div class="dimension-inputs">
        <input type="number" pattern="[0-9]*" inputmode="numeric" v-model.number="lengthFeet" :placeholder="t('feet')" min="0">
        <span>{{ t('feet') }}</span>
        <input type="number" pattern="[0-9]*" inputmode="numeric" v-model.number="lengthInches" :placeholder="t('inches')" min="0" max="11">
        <span>{{ t('inches') }}</span>
      </div>
       <p v-if="errors.lengthInches" class="error-message">{{ errors.lengthInches }}</p>
    </div>

    <div class="input-group">
      <label>{{ t('width') }}</label>
      <div class="dimension-inputs">
        <input type="number" pattern="[0-9]*" inputmode="numeric" v-model.number="widthFeet" :placeholder="t('feet')" min="0">
        <span>{{ t('feet') }}</span>
        <input type="number" pattern="[0-9]*" inputmode="numeric" v-model.number="widthInches" :placeholder="t('inches')" min="0" max="11">
        <span>{{ t('inches') }}</span>
      </div>
       <p v-if="errors.widthInches" class="error-message">{{ errors.widthInches }}</p>
    </div>

    <!-- Height Input (for 3D) -->
    <div class="input-group" v-show="calculationMode === '3d'"> <!-- Use v-show if element structure should remain -->
      <label>{{ t('height') }}</label>
      <div class="dimension-inputs">
        <input type="number" pattern="[0-9]*" inputmode="numeric" v-model.number="heightFeet" :placeholder="t('feet')" min="0">
        <span>{{ t('feet') }}</span>
        <input type="number" pattern="[0-9]*" inputmode="numeric" v-model.number="heightInches" :placeholder="t('inches')" min="0" max="11">
        <span>{{ t('inches') }}</span>
      </div>
      <p v-if="errors.heightInches" class="error-message">{{ errors.heightInches }}</p>
    </div>

    <!-- Result Section -->
    <div class="result" v-if="!hasErrors">
      <h3>{{ t(resultLabelKey) }}:</h3>
      <p>
        <span class="result-value">{{ calculatedResult }}</span>
        <span>{{ t(unitLabelKey) }}</span>
      </p>
    </div>
     <div v-else class="result error-message">
        {{ t('fixErrors') }}
     </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// --- i18n ---
const { t, locale } = useI18n({
  inheritLocale: true,
  useScope: 'global'
});

// Watch for locale changes from the select dropdown and save preference
watch(locale, (newLocale) => {
    try {
        localStorage.setItem('calculatorPreferredLanguage', newLocale);
    } catch (e) {
         console.warn("Could not save preferred language to localStorage.");
    }
    // Re-run validation on locale change to update error messages
    validateInches('length', lengthInches.value);
    validateInches('width', widthInches.value);
    if (calculationMode.value === '3d') {
        validateInches('height', heightInches.value);
    }
});

// --- Reactive State ---
const lengthFeet = ref(null);
const lengthInches = ref(null);
const widthFeet = ref(null);
const widthInches = ref(null);
const heightFeet = ref(null);
const heightInches = ref(null);
const calculationMode = ref('2d');

const errors = ref({
    lengthInches: null,
    widthInches: null,
    heightInches: null,
});

// --- Input Validation ---

// Helper function for inch validation logic
const validateInches = (dimension, value) => {
    const errorKey = `${dimension}Inches`; // e.g., 'lengthInches'
    if (value !== null) { // Only validate if not empty
        if (value < 0) {
            // Keep negative values disallowed and show error
            errors.value[errorKey] = t('errorInchesNegative'); // Use specific negative error message
            return false; // Indicate validation failed
        } else if (value >= 12) {
            // Auto-correct values >= 12 back to 11
            if (dimension === 'length') lengthInches.value = 11;
            else if (dimension === 'width') widthInches.value = 11;
            else if (dimension === 'height') heightInches.value = 11;
            errors.value[errorKey] = null; // Clear error after auto-correction
            return true; // Indicate validation passed (after correction)
        } else {
            // Value is valid (0-11)
            errors.value[errorKey] = null; // Clear error
            return true; // Indicate validation passed
        }
    } else {
        // Value is empty/null, clear error
        errors.value[errorKey] = null;
        return true; // Indicate validation passed (empty is ok)
    }
};

// Watchers now call the validation helper
watch(lengthInches, (newVal) => { validateInches('length', newVal); });
watch(widthInches, (newVal) => { validateInches('width', newVal); });
watch(heightInches, (newVal) => {
    // Only validate height if in 3D mode
    if (calculationMode.value === '3d') {
        validateInches('height', newVal);
    } else {
        errors.value.heightInches = null; // Clear error if not in 3D mode
    }
});

// Re-validate/clear height error when switching modes
watch(calculationMode, (newMode) => {
    if (newMode !== '3d') {
        errors.value.heightInches = null; // Clear error
    } else {
        // Re-validate height inches if switching TO 3D
        validateInches('height', heightInches.value);
    }
});

const hasErrors = computed(() => {
    // Check if any error message is currently set
    return Object.values(errors.value).some(error => error !== null);
});

// --- Helper Functions ---
const toTotalFeet = (feet, inches) => {
  const ft = Number(feet) || 0;
  // Use the potentially auto-corrected inch value if validation passed
  const inc = Number(inches) || 0;
  // No need to check >= 12 here as the watchers handle it
  if (inc < 0) return ft; // Avoid calculating with invalid negative inches
  return ft + (inc / 12.0);
};

// --- Computed Properties for Calculations ---
const totalLengthFeet = computed(() => toTotalFeet(lengthFeet.value, lengthInches.value));
const totalWidthFeet = computed(() => toTotalFeet(widthFeet.value, widthInches.value));
const totalHeightFeet = computed(() => toTotalFeet(heightFeet.value, heightInches.value));

const calculatedResult = computed(() => {
  // Return '--' if errors exist or essential inputs are missing/zero
  if (hasErrors.value) return '--';

  const L = totalLengthFeet.value;
  const W = totalWidthFeet.value;

  // Check for non-positive dimensions which make area calculation meaningless
   if ( L <= 0 || W <= 0 ) return '--';

  if (calculationMode.value === '3d') {
    const H = totalHeightFeet.value;
     if ( H <= 0 ) return '--'; // Also need positive height for 3D

    // Surface Area = 2 * (LW + LH + WH)
    const surfaceArea = 2 * ( (L * W) + (L * H) + (W * H) );
    return surfaceArea.toFixed(2);
  } else {
    // 2D Area = L * W
    const area = L * W;
    return area.toFixed(2);
  }
});

// --- Computed Property for Dynamic Result Label ---
// This computed property determines which translation key to use
// based on the calculation mode. The template uses `t(resultLabelKey)`
// to display the correctly translated label ("Area" or "Surface Area").
// This part already correctly handles requirement #2.
const resultLabelKey = computed(() => {
  return calculationMode.value === '3d' ? 'resultLabelSurfaceArea' : 'resultLabelArea';
});
const unitLabelKey = computed(() => {
  return calculationMode.value === '3d' ? 'unitSurfaceArea' : 'unitArea';
});
</script>

<!-- The <template> and <style> sections remain the same as before -->

<style scoped>
.calculator {
  font-family: inherit; /* Inherit from body/global styles */
  width: 100%;
  max-width: 450px; /* Slightly wider for better layout */
  margin: 10px;
  padding: 25px;
  border: 1px solid #dce1de;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.calculator h2 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 25px;
    color: #333;
    font-weight: 600;
}

.language-selector {
    text-align: right;
    margin-bottom: 15px;
    font-size: 0.9em;
}
.language-selector label {
    margin-right: 5px;
}
.language-selector select {
    padding: 3px 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #fff;
}

.mode-selector {
    text-align: center;
    margin-bottom: 25px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
}
.mode-selector label {
    margin: 0 12px;
    cursor: pointer;
    font-size: 0.95em;
    color: #555;
}
.mode-selector input[type="radio"] {
    margin-right: 4px;
    vertical-align: middle; /* Align radio button better with text */
}

.input-group {
  margin-bottom: 20px;
}

.input-group > label { /* Direct label child */
  display: block;
  margin-bottom: 8px;
  font-weight: 500; /* Slightly less bold */
  color: #444;
  font-size: 0.95em;
}

.dimension-inputs {
  display: flex;
  gap: 10px; /* Increased gap */
  align-items: center;
}

.dimension-inputs input[type="number"] {
  flex-basis: 100px; /* Give inputs a base width */
  flex-grow: 1; /* Allow them to grow */
  padding: 10px; /* Slightly larger padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
  text-align: right;
}
/* Hide spinner buttons */
.dimension-inputs input[type=number]::-webkit-inner-spin-button,
.dimension-inputs input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
.dimension-inputs input[type=number] { -moz-appearance: textfield; }

.dimension-inputs span { /* Unit labels (ft/in) */
  color: #666;
  font-size: 0.9em;
  flex-shrink: 0; /* Prevent unit labels from shrinking */
  min-width: 25px; /* Ensure space for units */
  text-align: left;
}

.result {
  margin-top: 25px;
  padding: 20px;
  background-color: #eef7ff; /* Lighter blue */
  border: 1px solid #cce4ff; /* Lighter blue border */
  border-radius: 6px;
  text-align: center;
}

.result h3 {
    margin: 0 0 10px 0;
    color: #0056b3;
    font-size: 1em;
    font-weight: 500;
}

.result-value {
  font-size: 2em; /* Larger result */
  font-weight: 600; /* Bolder result */
  color: #004085;
  margin-right: 8px;
  display: inline-block; /* Better spacing */
}
.result span:not(.result-value) { /* Unit in result */
    font-size: 1em;
    color: #004085;
}

.error-message {
    color: #dc3545; /* Bootstrap danger color */
    font-size: 0.85em;
    margin-top: 6px;
    min-height: 1em; /* Prevent layout shifts */
}

.result.error-message {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
    text-align: center;
    padding: 10px;
    font-size: 0.9em;
}

/* Focus styles for better accessibility */
input[type="number"]:focus, select:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>