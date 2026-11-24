import {isEarly,galleryEnabled,puzzleRoom} from './curriculum-profile.js';
// Display order is presentation. Stable IDs and explicit profiles are save identity.
// Package 1 runs the 16 legacy adapters; target requirements are data for later packages.
export const ACTIVE_PROFILE = 'compatibility';
export const CURRICULUM_REVISION = 4;
const freeze = value => { if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value; };
export const PUZZLES = freeze([
  {
    "id": "ventilation",
    "displayOrder": 1,
    "name": "Ventilation Governor",
    "roomId": "engine",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "NOT, binary signals and wiring"
    ],
    "prerequisites": [],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:ventilation"
    ],
    "roomAccessRequirements": {
      "roomId": "engine",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "NOT knowledge",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "ventilation"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "ventilation",
      "roomId": "engine",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "security",
    "displayOrder": 2,
    "name": "Bulkhead Interlock",
    "roomId": "corridor",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "AND and independent permissions"
    ],
    "prerequisites": [
      "ventilation"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:security"
    ],
    "roomAccessRequirements": {
      "roomId": "corridor",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "AND knowledge",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "security"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "security",
      "roomId": "corridor",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "ventilation"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "alarm",
    "displayOrder": 3,
    "name": "Atmospheric Alarm",
    "roomId": "life",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Inclusive OR and fan-out"
    ],
    "prerequisites": [
      "security"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:alarm"
    ],
    "roomAccessRequirements": {
      "roomId": "life",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "OR knowledge",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "alarm"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "alarm",
      "roomId": "life",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "security"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "scrubber",
    "displayOrder": 4,
    "name": "Scrubber Permissive",
    "roomId": "life",
    "type": "circuit",
    "contentVersion": 2,
    "validatorVersion": 2,
    "concepts": [
      "OR followed by NOT, NOR equivalence"
    ],
    "prerequisites": [
      "alarm"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:scrubber"
    ],
    "roomAccessRequirements": {
      "roomId": "life",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "NOR discovery and certification",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "scrubber"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "scrubber",
      "roomId": "life",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "alarm"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "safetycutoff",
    "displayOrder": 5,
    "name": "Emergency Safety Cutoff",
    "roomId": "life",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "AND followed by NOT, NAND"
    ],
    "prerequisites": [
      "scrubber"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:safetycutoff"
    ],
    "roomAccessRequirements": {
      "roomId": "life",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "future-package",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "NAND discovery and certification",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "safetycutoff"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": false,
    "compatibility": null
  },
  {
    "id": "nandnot",
    "displayOrder": 6,
    "name": "Lighting Inverter",
    "roomId": "relay",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "NAND inverter and functional completeness"
    ],
    "prerequisites": [
      "safetycutoff"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:nandnot"
    ],
    "roomAccessRequirements": {
      "roomId": "relay",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "NOT-from-NAND recipe",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "nandnot"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "nandnot",
      "roomId": "relay",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "scrubber"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "nandand",
    "displayOrder": 7,
    "name": "Entrance Latch",
    "roomId": "relay",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "NAND inversion produces AND"
    ],
    "prerequisites": [
      "nandnot"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:nandand"
    ],
    "roomAccessRequirements": {
      "roomId": "relay",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "AND-from-NAND recipe",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "nandand"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "nandand",
      "roomId": "relay",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "nandnot"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "nandor",
    "displayOrder": 8,
    "name": "Forward Latch",
    "roomId": "relay",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Input inversion and NAND produce OR"
    ],
    "prerequisites": [
      "nandand"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:nandor"
    ],
    "roomAccessRequirements": {
      "roomId": "relay",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "OR-from-NAND recipe, fabricator entitlement",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "nandor"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "nandor",
      "roomId": "relay",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "nandand"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "sensordiff",
    "displayOrder": 9,
    "name": "Conflicting Sensor Monitor",
    "roomId": "sensors",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "XOR as disagreement"
    ],
    "prerequisites": [
      "nandor"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:sensordiff"
    ],
    "roomAccessRequirements": {
      "roomId": "sensors",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "finite-gallery-supply",
      "allowedTypes": [
        "XOR"
      ],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "XOR knowledge",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "sensordiff"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },
  {
    "id": "xorfab",
    "displayOrder": 10,
    "name": "XOR Fabrication",
    "roomId": "sensors",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Four-NAND XOR construction"
    ],
    "prerequisites": [
      "sensordiff"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:xorfab"
    ],
    "roomAccessRequirements": {
      "roomId": "sensors",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "gallery-curriculum",
      "allowedTypes": [
        "NAND"
      ],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "XOR discovery and certification",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "xorfab"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.xor"
    ],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },
  {
    "id": "cryo_signed",
    "displayOrder": 11,
    "name": "Cryogenic Temperature Decoder",
    "roomId": "testbay",
    "type": "representation",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Signed interpretation and two's complement"
    ],
    "prerequisites": [
      "xorfab"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:cryo_signed"
    ],
    "roomAccessRequirements": {
      "roomId": "testbay",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "equipment-configuration",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "Signed-data manual entry",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "cryo_signed"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "curriculumOnly": true,
    "compatibility": null
  },
  {
    "id": "hull",
    "displayOrder": 12,
    "name": "Hull Sensor Voter",
    "roomId": "testbay",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Two-of-three majority logic"
    ],
    "prerequisites": [
      "cryo_signed"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:hull"
    ],
    "roomAccessRequirements": {
      "roomId": "testbay",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Voter certification",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "hull"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "hull",
      "roomId": "sensors",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "nandor"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "pressure_width",
    "displayOrder": 13,
    "name": "Pressure Register",
    "roomId": "testbay",
    "type": "representation",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Unsigned range and inclusive endpoints"
    ],
    "prerequisites": [
      "hull"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:pressure_width"
    ],
    "roomAccessRequirements": {
      "roomId": "testbay",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "equipment-configuration",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "Width-sizing manual entry",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "pressure_width"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "curriculumOnly": true,
    "compatibility": null
  },
  {
    "id": "log_overflow",
    "displayOrder": 14,
    "name": "Navigation Log Overflow",
    "roomId": "blackbox",
    "type": "representation",
    "contentVersion": 2,
    "validatorVersion": 2,
    "concepts": [
      "Integer ranges, promotions and unsigned narrowing"
    ],
    "prerequisites": [
      "pressure_width"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:log_overflow"
    ],
    "roomAccessRequirements": {
      "roomId": "blackbox",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "equipment-console",
      "requiresFabrication": false,
      "allowedTypes": []
    },
    "rewards": {
      "description": "Engineering Manual reference",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "log_overflow"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },
  {
    "id": "navbits",
    "displayOrder": 15,
    "name": "Half Adder",
    "roomId": "computation",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Sum, carry and XOR"
    ],
    "prerequisites": [
      "log_overflow"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:navbits"
    ],
    "roomAccessRequirements": {
      "roomId": "computation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "manufactured",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified HA1",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "navbits"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.arithmetic"
    ],
    "implemented": true,
    "compatibility": {
      "repairId": "navbits",
      "roomId": "navigation",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "nandor"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "trajectory",
    "displayOrder": 16,
    "name": "Full Adder",
    "roomId": "computation",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Full adder and ripple carry"
    ],
    "prerequisites": [
      "navbits"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:trajectory"
    ],
    "roomAccessRequirements": {
      "roomId": "computation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "manufactured",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified FA1",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "trajectory"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.arithmetic"
    ],
    "implemented": true,
    "compatibility": {
      "repairId": "trajectory",
      "roomId": "navigation",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "navbits"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "ripple_adder",
    "displayOrder": 17,
    "name": "Four-Bit Ripple-Carry Adder",
    "roomId": "computation",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Full Adder stages, carry propagation and component abstraction"
    ],
    "prerequisites": [
      "trajectory"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:ripple_adder"
    ],
    "roomAccessRequirements": {
      "roomId": "computation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "installed-bench",
      "allowedTypes": [],
      "requiresFabrication": false
    },
    "rewards": {
      "description": "ADD4C reference and construction authorization",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "ripple_adder"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },
  {
    "id": "twos_complement",
    "displayOrder": 18,
    "name": "Two's Complement Converter",
    "roomId": "computation",
    "type": "representation",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Fixed-width two's-complement negation"
    ],
    "prerequisites": [
      "ripple_adder"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:twos_complement"
    ],
    "roomAccessRequirements": {
      "roomId": "computation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "equipment-console",
      "requiresFabrication": false,
      "allowedTypes": []
    },
    "rewards": {
      "description": "Engineering Manual reference",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "twos_complement"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },
  {
    "id": "addsub",
    "displayOrder": 19,
    "name": "Four-Bit Subtractor",
    "roomId": "computation",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Four-bit subtraction through inversion and carry"
    ],
    "prerequisites": [
      "twos_complement"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:addsub"
    ],
    "roomAccessRequirements": {
      "roomId": "computation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "manufactured",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified four-bit subtractor",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "addsub"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.arithmetic"
    ],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },
  {
    "id": "float_nav",
    "displayOrder": 20,
    "name": "Controllable Adder/Subtractor",
    "roomId": "navigation",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Hardware reuse",
      "XOR conditional inversion",
      "Control fan-out",
      "Four-bit buses",
      "Shared ADD/SUB datapath"
    ],
    "prerequisites": [
      "addsub"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:float_nav"
    ],
    "roomAccessRequirements": {
      "roomId": "navigation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "manufactured",
      "allowedTypes": [
        "XOR4",
        "FAN4"
      ],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "P20 arithmetic foundation; authoritative Credits reward on engagement",
      "implemented": true
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "float_nav"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": null,
    "curriculumOnly": true
  },

  {
    "id": "mux",
    "displayOrder": 21,
    "name": "Data-Path Selector",
    "roomId": "navigation",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Boolean selection and parallel bit slices"
    ],
    "prerequisites": [
      "nandor"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:mux"
    ],
    "roomAccessRequirements": {
      "roomId": "navigation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "future-package",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified MUX1 and MUX4",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "mux"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.mux"
    ],
    "implemented": false,
    "compatibility": null
  },
  {
    "id": "alu",
    "displayOrder": 22,
    "name": "Flight Arithmetic Unit",
    "roomId": "navigation",
    "type": "circuit",
    "contentVersion": 2,
    "validatorVersion": 2,
    "concepts": [
      "Four-bit ADD, SUB, AND, XOR and selection"
    ],
    "prerequisites": [
      "addsub",
      "mux"
    ],
    "requiredCertifications": [
      "ADDSUB4",
      "MUX4"
    ],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:alu"
    ],
    "roomAccessRequirements": {
      "roomId": "navigation",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified ALU4",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "alu"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.alu"
    ],
    "implemented": true,
    "compatibility": {
      "repairId": "alu",
      "roomId": "bridge",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "trajectory"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "memory",
    "displayOrder": 23,
    "name": "Course Memory Register",
    "roomId": "reactor",
    "type": "circuit",
    "contentVersion": 2,
    "validatorVersion": 2,
    "concepts": [
      "SR latch, D latch, edge-triggered DFF and register"
    ],
    "prerequisites": [
      "nandor"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:memory"
    ],
    "roomAccessRequirements": {
      "roomId": "reactor",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified gate-built DFF and REG2",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "memory"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.storage"
    ],
    "implemented": true,
    "compatibility": {
      "repairId": "memory",
      "roomId": "reactor",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "nandor"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "reactor",
    "displayOrder": 24,
    "name": "Reactor Restart Sequencer",
    "roomId": "reactor",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Synchronous state and counter feedback"
    ],
    "prerequisites": [
      "memory"
    ],
    "requiredCertifications": [
      "DFF",
      "REG2"
    ],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:reactor"
    ],
    "roomAccessRequirements": {
      "roomId": "reactor",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified CTR2",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "reactor"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.counter"
    ],
    "implemented": true,
    "compatibility": {
      "repairId": "reactor",
      "roomId": "reactor",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "memory"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "flightmemory",
    "displayOrder": 25,
    "name": "Armed Flight Arithmetic Register",
    "roomId": "reactor",
    "type": "circuit",
    "contentVersion": 2,
    "validatorVersion": 2,
    "concepts": [
      "Clocked arithmetic with true enable-and-hold"
    ],
    "prerequisites": [
      "memory",
      "navbits",
      "mux"
    ],
    "requiredCertifications": [
      "DFF",
      "HA1",
      "MUX1"
    ],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:flightmemory"
    ],
    "roomAccessRequirements": {
      "roomId": "reactor",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Certified ENARITHREG2",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "flightmemory"
      }
    ],
    "optionalBlueprintSuggestions": [
      "bp.enable"
    ],
    "implemented": true,
    "compatibility": {
      "repairId": "flightmemory",
      "roomId": "bridge",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "alu",
        "memory",
        "navbits"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  },
  {
    "id": "array_recovery",
    "displayOrder": 26,
    "name": "Sensor Array Memory Recovery",
    "roomId": "reactor",
    "type": "representation",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Byte addresses, arrays, stride and pointer arithmetic"
    ],
    "prerequisites": [
      "log_overflow"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [
      "decoder.foundation"
    ],
    "investigationRequirements": [
      "equipment:array_recovery"
    ],
    "roomAccessRequirements": {
      "roomId": "reactor",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "future-package",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Memory-inspector certification",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "array_recovery"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": false,
    "compatibility": null
  },
  {
    "id": "first_instruction",
    "displayOrder": 27,
    "name": "First Instruction",
    "roomId": "bridge",
    "type": "processor",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Fetch, decode, execute and writeback"
    ],
    "prerequisites": [
      "alu",
      "memory",
      "array_recovery"
    ],
    "requiredCertifications": [
      "ALU4",
      "REG2"
    ],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:first_instruction"
    ],
    "roomAccessRequirements": {
      "roomId": "bridge",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "future-package",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Processor step authorization",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "first_instruction"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": false,
    "compatibility": null
  },
  {
    "id": "flight_program",
    "displayOrder": 28,
    "name": "Program the Flight Computer",
    "roomId": "bridge",
    "type": "processor",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Register programming, ALU operations and mapped output"
    ],
    "prerequisites": [
      "first_instruction",
      "flightmemory",
      "reactor"
    ],
    "requiredCertifications": [
      "ALU4",
      "REG2"
    ],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:flight_program"
    ],
    "roomAccessRequirements": {
      "roomId": "bridge",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "future-package",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Validated refuge-control program",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "flight_program"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": false,
    "compatibility": null
  },
  {
    "id": "override",
    "displayOrder": 29,
    "name": "Crew Authority Selector",
    "roomId": "bridge",
    "type": "circuit",
    "contentVersion": 1,
    "validatorVersion": 1,
    "concepts": [
      "Arming and mutually exclusive pilot authority"
    ],
    "prerequisites": [
      "flight_program"
    ],
    "requiredCertifications": [],
    "conceptPrerequisites": [],
    "investigationRequirements": [
      "equipment:override"
    ],
    "roomAccessRequirements": {
      "roomId": "bridge",
      "requiresLocalPresence": true
    },
    "toolPolicy": {
      "source": "legacy-adapter",
      "allowedTypes": [],
      "requiresFabrication": true
    },
    "rewards": {
      "description": "Manual or G.R.E.G. ending",
      "implemented": false
    },
    "completionEvents": [
      {
        "type": "machine.repaired",
        "machineId": "override"
      }
    ],
    "optionalBlueprintSuggestions": [],
    "implemented": true,
    "compatibility": {
      "repairId": "override",
      "roomId": "bridge",
      "contentVersion": 1,
      "validatorVersion": 1,
      "prerequisites": [
        "alu",
        "flightmemory"
      ],
      "conceptPrerequisites": [],
      "requiredCertifications": [],
      "toolPolicy": {
        "source": "legacy-repair",
        "unlimited": true
      }
    }
  }
]);
const HISTORICAL_FIREWALL = freeze({"id": "firewall", "displayOrder": 14, "name": "Sensor Status Decoder", "roomId": "blackbox", "type": "representation", "contentVersion": 2, "validatorVersion": 2, "concepts": ["Bitwise AND, OR and status masks"], "prerequisites": ["pressure_width"], "requiredCertifications": [], "conceptPrerequisites": [], "investigationRequirements": ["equipment:firewall"], "roomAccessRequirements": {"roomId": "blackbox", "requiresLocalPresence": true}, "toolPolicy": {"source": "equipment-console", "requiresFabrication": false, "allowedTypes": []}, "rewards": {"description": "Engineering Manual reference", "implemented": true}, "completionEvents": [{"type": "machine.repaired", "machineId": "firewall"}], "optionalBlueprintSuggestions": [], "implemented": true, "compatibility": {"repairId": "firewall", "roomId": "sensors", "contentVersion": 1, "validatorVersion": 1, "prerequisites": ["nandor"], "conceptPrerequisites": [], "requiredCertifications": [], "toolPolicy": {"source": "legacy-repair", "unlimited": true}}});
const ASCII_ACTIVITY = freeze({"id": "adc_precision", "displayOrder": null, "name": "ASCII Transmission Terminal", "roomId": "blackbox", "type": "representation", "contentVersion": 2, "validatorVersion": 2, "concepts": ["ASCII, char arrays and null termination"], "prerequisites": ["pressure_width"], "requiredCertifications": [], "conceptPrerequisites": [], "investigationRequirements": ["equipment:adc_precision"], "roomAccessRequirements": {"roomId": "blackbox", "requiresLocalPresence": true}, "toolPolicy": {"source": "equipment-console", "requiresFabrication": false, "allowedTypes": []}, "rewards": {"description": "Engineering Manual reference", "implemented": true}, "completionEvents": [{"type": "machine.repaired", "machineId": "adc_precision"}], "optionalBlueprintSuggestions": [], "implemented": true, "compatibility": null, "curriculumOnly": true, "numbered": false});
export const COMPATIBILITY_PUZZLES=Object.freeze([HISTORICAL_FIREWALL]);
export const PUZZLE_DEFINITIONS = Object.freeze(Object.fromEntries(PUZZLES.map(p=>[p.id,p])));
export const ROOM_IDS = Object.freeze(['engine','corridor','life','relay','sensors','testbay','blackbox','computation','navigation','reactor','bridge']);
export const ROOM_RECORDS = Object.freeze({corridor:'override',life:'record_life',relay:'record_relay',sensors:'record_sensors',navigation:'record_navigation',reactor:'record_reactor',bridge:'record_bridge'});
export const getPuzzle = id => typeof id==='string'&&Object.hasOwn(PUZZLE_DEFINITIONS,id)?PUZZLE_DEFINITIONS[id]:id==='firewall'?HISTORICAL_FIREWALL:id==='adc_precision'?ASCII_ACTIVITY:null;
function basePlayablePuzzle(id,w){
  const p=getPuzzle(id);
  if(galleryEnabled(w)&&id==='firewall')return null;
  if(galleryEnabled(w)&&['navbits','trajectory','ripple_adder','twos_complement','addsub'].includes(id))return {...p,roomAccessRequirements:{roomId:'computation',requiresLocalPresence:true}};
  if(galleryEnabled(w)&&['adc_precision','log_overflow'].includes(id))return {...p,roomAccessRequirements:{roomId:'sensors',requiresLocalPresence:true}};
  if(galleryEnabled(w)&&id==='hull')return {...p,prerequisites:['cryo_signed'],conceptPrerequisites:[],requiredCertifications:[],toolPolicy:{source:'manufactured',requiresFabrication:true},roomAccessRequirements:{roomId:'sensors',requiresLocalPresence:true}};
  if(p?.curriculumOnly)return galleryEnabled(w)?{...p,roomAccessRequirements:{roomId:p.roomId,requiresLocalPresence:true}}:null;
  if(isEarly(w)&&id==='safetycutoff')return {...p,implemented:true,roomId:'life',contentVersion:1,validatorVersion:1,prerequisites:['scrubber'],conceptPrerequisites:[],requiredCertifications:[],toolPolicy:{source:'finite'},roomAccessRequirements:{roomId:'life',requiresLocalPresence:true}};
  return p?.implemented ? {...p,...p.compatibility,plannedRoomId:p.roomId,id:p.id,roomAccessRequirements:{...p.roomAccessRequirements,roomId:p.compatibility?.roomId||p.roomId}} : null;
}
export function getPlayablePuzzle(id,w){
 const p=basePlayablePuzzle(id,w);if(!p)return p;const room=puzzleRoom(w,id,p.roomId);
 return {...p,roomId:room,roomAccessRequirements:{...p.roomAccessRequirements,roomId:puzzleRoom(w,id,p.roomAccessRequirements.roomId)}};
}
export function roomPuzzles(roomId,profile=ACTIVE_PROFILE){
  return (profile==='curriculum'?PUZZLES:[...PUZZLES,...COMPATIBILITY_PUZZLES]).filter(p=>profile==='curriculum'?p.roomId===roomId:p.implemented&&!p.curriculumOnly&&(p.compatibility?.roomId||p.roomId)===roomId);
}
export function validateRegistry(puzzles=PUZZLES){
  const errors=[],byId=new Map(puzzles.map(p=>[p.id,p]));
  if(byId.size!==puzzles.length)errors.push('Duplicate puzzle IDs.');
  const done=new Set(),active=new Set();
  function visit(id){
    if(active.has(id)){errors.push('Dependency cycle at '+id);return;}
    if(done.has(id))return;
    active.add(id);
    for(const dep of byId.get(id)?.prerequisites||[]){if(!byId.has(dep))errors.push('Unknown prerequisite '+dep);else visit(dep);}
    active.delete(id);done.add(id);
  }
  for(const p of puzzles){if(!ROOM_IDS.includes(p.roomId))errors.push('Unknown room '+p.roomId);visit(p.id);for(const dep of p.compatibility?.prerequisites||[])if(!byId.has(dep))errors.push('Unknown compatibility prerequisite '+dep);}
  return {ok:!errors.length,errors};
}
