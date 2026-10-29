// Story & camp text (original, carried over from the story bible). Data only.
export const STORY={
 "ZT": {
  "walker": {
   "hp": 3,
   "sp": 1,
   "grab": 0.6
  },
  "runner": {
   "hp": 2,
   "sp": 1.9,
   "grab": 0.4
  },
  "crawler": {
   "hp": 2,
   "sp": 0.55,
   "grab": 0.8
  },
  "bloater": {
   "hp": 3,
   "sp": 0.7,
   "grab": 0
  },
  "riot": {
   "hp": 4,
   "sp": 0.85,
   "grab": 0.5,
   "armor": 3
  },
  "screamer": {
   "hp": 2,
   "sp": 0.9,
   "grab": 0.3
  },
  "spitter": {
   "hp": 3,
   "sp": 0.8,
   "grab": 0.2
  },
  "drowned": {
   "hp": 4,
   "sp": 0.8,
   "grab": 0.9
  },
  "frozen": {
   "hp": 5,
   "sp": 0.65,
   "grab": 0.5
  }
 },
 "ZNAMES": {
  "walker": "WALKER",
  "runner": "RUNNER",
  "crawler": "CRAWLER",
  "bloater": "BLOATER",
  "riot": "RIOT SHELL",
  "screamer": "SCREAMER",
  "spitter": "SPITTER",
  "drowned": "DROWNED",
  "frozen": "FROZEN"
 },
 "CAMP_META": {
  "D": {
   "N": [
    80,
    22
   ],
   "S": [
    80,
    122
   ],
   "E": [
    138,
    72
   ],
   "W": [
    22,
    72
   ]
  }
 },
 "CH": [
  {
   "id": 1,
   "title": "HOLLOWMERE",
   "place": "Harlan Falls, USA",
   "who": "Linh Tran, courier",
   "weather": "rain",
   "mech": "none",
   "memOpen": [
    "Before: Mom's noodle stall.",
    "Minh, 9, steals my herbs.",
    "\"Chi Linh, promise you'll",
    "always come back for me.\""
   ],
   "intro": [
    "\"Day 3 of the sickness.",
    "I took shelter in the old",
    "manor. The door locked",
    "behind me. I was not alone.\""
   ],
   "outro": [
    "\"The crests clicked home.",
    "The door opened on a town",
    "with no lights left on.",
    "I had a scratch on my arm.",
    "I told no one. I kept",
    "driving my route.\""
   ],
   "rooms": [
    {
     "n": "FOYER",
     "floor": "tile",
     "d": {
      "N": 1,
      "E": 4,
      "W": 5,
      "S": "exit"
     },
     "safe": false
    },
    {
     "n": "DINING HALL",
     "floor": "wood",
     "d": {
      "S": 0,
      "W": 2,
      "E": 3
     },
     "safe": false
    },
    {
     "n": "LIBRARY",
     "floor": "stone",
     "d": {
      "E": 1
     },
     "safe": false
    },
    {
     "n": "GALLERY",
     "floor": "carpet",
     "d": {
      "W": 1
     },
     "safe": false
    },
    {
     "n": "STUDY",
     "floor": "moss",
     "d": {
      "W": 0
     },
     "safe": true
    },
    {
     "n": "CELLAR",
     "floor": "stone",
     "d": {
      "E": 0
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 2,
     "k": "moon",
     "name": "Silver Moon Crest"
    },
    {
     "r": 5,
     "k": "sun",
     "name": "Golden Sun Crest"
    },
    {
     "r": 3,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 3,
     "k": "herb"
    },
    {
     "r": 1,
     "k": "herb"
    },
    {
     "r": 4,
     "k": "ammo",
     "n": 4
    },
    {
     "r": 4,
     "k": "letter",
     "name": "Letter to Minh",
     "read": "\"Minh - if the phones die, I will keep driving the route. Wait for my truck. - Linh\"",
     "mem": [
      "Mom called the night",
      "she died. I was driving.",
      "I let it ring."
     ]
    }
   ],
   "exit": {
    "r": 0,
    "needs": [
     "moon",
     "sun"
    ],
    "locked": "The front door bears two empty crest slots: a MOON and a SUN.",
    "done": "The crests click home."
   },
   "scares": [
    {
     "r": 2,
     "after": "moon",
     "type": "window"
    },
    {
     "r": 3,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    1,
    1,
    2,
    3,
    0
   ],
   "boss": {
    "r": 5,
    "hp": 14,
    "name": "THE SWOLLEN ONE",
    "mech": "charge",
    "p2": "It tears the boiler pipe loose. Steam everywhere!",
    "memP2": [
     "Minh learning to ride,",
     "me running behind the bike.",
     "\"Don't let go, Chi!\""
    ],
    "memFin": [
     "Minh asleep in my truck,",
     "wrapped in my jacket.",
     "Warm. Safe. Before."
    ]
   },
   "extra": {},
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "hero",
       "My name is Linh Tran. I deliver parcels.",
       "hero"
      ],
      [
       "hero",
       "Last stop of the night: Hollowmere House.",
       "hero"
      ],
      [
       null,
       "The door was open. The lights were not.",
       "wide",
       "silence"
      ],
      [
       "hero",
       "Minh is waiting for dinner. Twenty minutes, then home.",
       "hero"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "Close the door! Close it!",
       "npc0",
       "shake"
      ],
      [
       "hero",
       "Ma'am, I'm a courier. Are you hurt?",
       "hero"
      ],
      [
       "npc0",
       "My husband went down to the cellar. He came back... different.",
       "npc0"
      ],
      [
       "hero",
       "Stay here. I'll find a way out.",
       "hero"
      ]
     ]
    },
    {
     "on": "room:4",
     "s": [
      [
       null,
       "A dead CB radio sits on the study desk.",
       "wide",
       "silence"
      ],
      [
       "hero",
       "Still has a battery. Hello? Anyone?",
       "hero",
       "static"
      ],
      [
       "radio",
       "...ksshh... roads closed... north... ksshh...",
       "hero",
       "static"
      ],
      [
       "hero",
       "If I get out, I'm talking back. Somebody has to tell people where it's safe.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "item:moon",
     "s": [
      [
       "hero",
       "A silver crest. The other one is below. Of course it's below.",
       "hero"
      ],
      [
       null,
       "Below the floor, something breathes in long, wet pulls.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "The cellar door groans open on its own.",
       "wide",
       "silence"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "hero",
       "Oh God. Mr. Addo?",
       "hero"
      ],
      [
       "boss",
       "RRAAAGH",
       "boss",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "hero",
       "I'm sorry. I'm so sorry.",
       "hero"
      ],
      [
       "npc0",
       "Is it over? Is he...",
       "npc0"
      ],
      [
       "hero",
       "He's at peace now. Let's go.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Account one. My sister's. I found it typed on a delivery slip.",
       "minh",
       "swell"
      ],
      [
       "minh",
       "She took the radio from that house. That's where the Courier began.",
       "minh"
      ]
     ]
    }
   ],
   "mix": [
    "walker",
    "crawler",
    "walker",
    "runner",
    "walker"
   ],
   "skins": [
    "house",
    "house",
    "civ"
   ],
   "npcs": [
    {
     "r": 0,
     "name": "MRS. ADDO",
     "age": "elder",
     "seed": 3,
     "lines": [
      "\"I hid under the stairs for two days.\"",
      "\"My husband went to the cellar. Don't.\""
     ],
     "give": {
      "k": "herb"
     },
     "thanks": "\"Take my herb. My knees won't run anyway.\""
    },
    {
     "r": 2,
     "name": "OWEN",
     "age": "kid",
     "seed": 11,
     "lines": [
      "\"Are you a police?\"",
      "\"I can be very quiet. Watch.\""
     ]
    }
   ],
   "camp": {
    "kind": "lantern",
    "fire": [
     56,
     88
    ],
    "bye": [
     "\"Go. Owen and I will keep the lamp lit until morning.\"",
     "\"Will you come back? ...You can say yes even if it's a lie.\""
    ],
    "req": {
     "who": 1,
     "text": "\"There are things in the gallery. Make them stop scratching. Please.\"",
     "kills": 3,
     "reward": {
      "k": "ammo",
      "n": 8
     },
     "done": "\"It's quiet. Thank you. I drew you a picture. It's a truck.\""
    }
   }
  },
  {
   "id": 2,
   "title": "SALT ROAD",
   "place": "Da Nang, Vietnam",
   "who": "Huong Le, boat mechanic",
   "weather": "storm",
   "mech": "tide",
   "memOpen": [
    "Before: Duc fixed the motor,",
    "kissed my forehead,",
    "said \"back by noon.\"",
    "He never came back.",
    "...",
    "Years later, a radio voice",
    "called COURIER read out",
    "the safe roads. A woman."
   ],
   "intro": [
    "\"The harbor closed at dusk.",
    "My son, my mother, and one",
    "boat with a dead engine.",
    "The tide was coming in.\""
   ],
   "outro": [
    "\"We cleared the breakwater",
    "at the last light. On the",
    "radio: Courier, still",
    "driving. Still alive.",
    "I wondered who she was",
    "driving home to.\""
   ],
   "rooms": [
    {
     "n": "FISH MARKET",
     "floor": "planks",
     "d": {
      "N": 1,
      "E": 2
     },
     "safe": false
    },
    {
     "n": "PIER A",
     "floor": "planks",
     "d": {
      "S": 0,
      "E": 3,
      "N": 5
     },
     "safe": false
    },
    {
     "n": "NET SHED",
     "floor": "wood",
     "d": {
      "W": 0
     },
     "safe": true
    },
    {
     "n": "HARBOR OFFICE",
     "floor": "tile",
     "d": {
      "W": 1,
      "S": 4
     },
     "safe": false
    },
    {
     "n": "FUEL DOCK",
     "floor": "metal",
     "d": {
      "N": 3
     },
     "safe": false
    },
    {
     "n": "PIER END",
     "floor": "planks",
     "d": {
      "S": 1,
      "N": "exit"
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 3,
     "k": "plug",
     "name": "Spark Plug"
    },
    {
     "r": 4,
     "k": "fuel",
     "name": "Fuel Can"
    },
    {
     "r": 0,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 2,
     "k": "herb"
    },
    {
     "r": 4,
     "k": "herb"
    },
    {
     "r": 3,
     "k": "ammo",
     "n": 5
    },
    {
     "r": 3,
     "k": "letter",
     "name": "Radio Log",
     "read": "\"02:10 - COURIER: Route 9 bridge clear. Keep moving. I'm driving north to find my brother.\"",
     "mem": [
      "My son's first catch.",
      "Duc laughing so hard",
      "the boat rocked."
     ]
    }
   ],
   "exit": {
    "r": 5,
    "needs": [
     "plug",
     "fuel"
    ],
    "locked": "The engine needs a SPARK PLUG and a FUEL CAN.",
    "done": "The engine coughs, then roars."
   },
   "scares": [
    {
     "r": 3,
     "after": "plug",
     "type": "window"
    },
    {
     "r": 4,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    0,
    0,
    1,
    1,
    3,
    4,
    4,
    5
   ],
   "boss": {
    "r": 5,
    "hp": 16,
    "name": "THE NET-BOUND",
    "mech": "summon",
    "p2": "It rips free of the nets. Crabs of flesh crawl out!",
    "memP2": [
     "Duc's jacket still hangs",
     "by the door. I never",
     "washed it."
    ],
    "memFin": [
     "Our wedding on the beach.",
     "Lanterns on the water.",
     "Warm. Safe. Before."
    ]
   },
   "extra": {
    "tide": 300
   },
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "hero",
       "Huong Le. Boat mechanic, Da Nang harbor.",
       "hero"
      ],
      [
       "hero",
       "I wear my husband's hat. Duc never took it fishing.",
       "hero"
      ],
      [
       null,
       "Rain hammers the tin roofs. The tide clock is running.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "Little Huong! You still fix engines?",
       "npc0"
      ],
      [
       "hero",
       "Grandpa Sau. Is the blue boat still afloat?",
       "hero"
      ],
      [
       "npc0",
       "Afloat. Not alive. Needs a plug and fuel.",
       "npc0"
      ],
      [
       "npc1",
       "Is Daddy on the radio tonight?",
       "npc1"
      ]
     ]
    },
    {
     "on": "room:3",
     "s": [
      [
       null,
       "The harbor radio crackles alive.",
       "wide",
       "static"
      ],
      [
       "radio",
       "This is COURIER. Bridge on Route 9 is clear. Keep moving.",
       "hero",
       "static"
      ],
      [
       "radio",
       "I'm driving north to find my brother. If you hear me... wait for my truck.",
       "hero",
       "static"
      ],
      [
       "hero",
       "A woman. Alone, out there. Still talking.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "mid",
     "s": [
      [
       null,
       "Chains drag across wet planks.",
       "wide",
       "silence"
      ],
      [
       "mid",
       "...",
       "mid",
       "shake"
      ],
      [
       "hero",
       "That coat. That's the harbor captain.",
       "hero"
      ],
      [
       "mid",
       "The anchor rises. So does he.",
       "mid",
       "swell"
      ]
     ]
    },
    {
     "on": "midfin",
     "s": [
      [
       "hero",
       "He used to wave at Duc every morning.",
       "hero"
      ],
      [
       null,
       "The sea takes him back.",
       "mid",
       "swell"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "The tide hisses through the pier boards.",
       "wide",
       "silence"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "hero",
       "Nets. Bodies tangled in nets.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "hero",
       "Duc, if you're out there... I'm taking our son home.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Account two. Huong never knew the Courier's name.",
       "minh"
      ],
      [
       "minh",
       "I did. I kept writing anyway.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "drowned",
    "walker",
    "bloater",
    "drowned",
    "runner",
    "crawler",
    "spitter",
    "drowned"
   ],
   "skins": [
    "fisher",
    "civ",
    "market"
   ],
   "mid": {
    "r": 4,
    "hp": 12,
    "name": "THE DROWNED CAPTAIN",
    "atk": [
     "charge",
     "grab"
    ],
    "atk2": [
     "summon:drowned",
     "charge"
    ],
    "p2": "He drags his anchor chain. The water answers.",
    "fin": "You cut the chain. He sinks for the last time.",
    "drop": {
     "k": "ammo",
     "n": 8
    }
   },
   "npcs": [
    {
     "r": 2,
     "name": "GRANDPA SAU",
     "age": "elder",
     "seed": 21,
     "lines": [
      "\"Forty years on this water.\"",
      "\"The tide waits for no one. Hurry.\""
     ],
     "give": {
      "k": "ammo",
      "n": 4
     },
     "thanks": "\"Flare rounds. Old, but they bang.\""
    },
    {
     "r": 2,
     "name": "MAI",
     "age": "kid",
     "seed": 24,
     "lines": [
      "\"My dad fixes boats too!\"",
      "\"He's on the radio. Every night.\""
     ]
    },
    {
     "r": 0,
     "name": "VENDOR THU",
     "seed": 7,
     "lines": [
      "\"I kept the stall open. Habit.\"",
      "\"Fish won't sell itself. Not anymore.\""
     ]
    }
   ],
   "camp": {
    "kind": "campfire",
    "fire": [
     64,
     96
    ],
    "bye": [
     "\"The tide turns soon. Don't look back at the water.\"",
     "\"I'll keep your fish warm. Joke. There is no fish.\"",
     "\"Thu always comes back. You come back too.\""
    ],
    "req": {
     "who": 0,
     "text": "\"My nets need scrap to weight them. Bring me 3 pieces.\"",
     "need": {
      "k": "scrap",
      "n": 3
     },
     "reward": {
      "k": "ammo",
      "n": 12
     },
     "done": "\"Good weight. Take these shells, I won't miss them.\""
    }
   }
  },
  {
   "id": 3,
   "title": "NINTH FLOOR",
   "place": "Lagos, Nigeria",
   "who": "Adaeze Okafor, night nurse",
   "weather": "none",
   "mech": "dark",
   "memOpen": [
    "Before: Papa's hand in mine,",
    "the night he passed.",
    "\"Never leave a patient,",
    "Ada.\" I promised.",
    "...",
    "Day 9: a patient came in",
    "wearing a courier jacket.",
    "LINH stitched on the collar."
   ],
   "intro": [
    "\"The generator died at",
    "midnight. Nine patients.",
    "No lights. Something was",
    "walking the corridor.\""
   ],
   "outro": [
    "\"The lift came back to life.",
    "Every patient made it down.",
    "The woman in the jacket",
    "was gone. Just the jacket,",
    "folded on her bed.\""
   ],
   "rooms": [
    {
     "n": "WARD 9A",
     "floor": "clinic",
     "d": {
      "E": 1,
      "N": 3
     },
     "safe": true
    },
    {
     "n": "CORRIDOR",
     "floor": "clinic",
     "d": {
      "W": 0,
      "E": 2,
      "N": 4
     },
     "safe": false
    },
    {
     "n": "SUPPLY ROOM",
     "floor": "metal",
     "d": {
      "W": 1
     },
     "safe": false
    },
    {
     "n": "GENERATOR",
     "floor": "metal",
     "d": {
      "S": 0
     },
     "safe": false
    },
    {
     "n": "THEATRE",
     "floor": "clinic",
     "d": {
      "S": 1,
      "N": "exit"
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 2,
     "k": "fuse",
     "name": "Fuse A"
    },
    {
     "r": 1,
     "k": "fuse2",
     "name": "Fuse B"
    },
    {
     "r": 0,
     "k": "herb"
    },
    {
     "r": 2,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 3,
     "k": "herb"
    },
    {
     "r": 1,
     "k": "ammo",
     "n": 4
    },
    {
     "r": 0,
     "k": "letter",
     "name": "Courier Jacket",
     "read": "A courier jacket. LINH stitched on the collar. A long scratch in the sleeve lining.",
     "mem": [
      "Papa taught me to stitch",
      "wounds on a ripe mango.",
      "We ate the patient."
     ]
    }
   ],
   "exit": {
    "r": 4,
    "needs": [
     "power"
    ],
    "locked": "The lift is dead. Restore the GENERATOR first.",
    "done": "The lift doors shudder open."
   },
   "scares": [
    {
     "r": 1,
     "after": "fuse2",
     "type": "window"
    },
    {
     "r": 2,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    1,
    1,
    2,
    3,
    4,
    0
   ],
   "boss": {
    "r": 4,
    "hp": 16,
    "name": "THE SURGEON",
    "mech": "strobe",
    "p2": "The lights strobe. It moves only in the dark!",
    "memP2": [
     "My first night shift.",
     "Papa waited outside",
     "with hot akara."
    ],
    "memFin": [
     "Graduation day.",
     "Papa in his best agbada,",
     "crying, proud. Before."
    ]
   },
   "extra": {
    "gen": {
     "r": 3,
     "x": 80,
     "y": 40,
     "needs": [
      "fuse",
      "fuse2"
     ],
     "msg": "Power restored. The lights hum back on."
    }
   },
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "hero",
       "Adaeze Okafor. Night nurse, ward nine.",
       "hero"
      ],
      [
       "hero",
       "My lanyard still opens doors. The lift doesn't move.",
       "hero"
      ],
      [
       null,
       "The lights flicker. Then nothing.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "Nurse! You came back up.",
       "npc0"
      ],
      [
       "hero",
       "Doctor. How many still breathing?",
       "hero"
      ],
      [
       "npc0",
       "Here? Two. The generator room has fuses, if you can reach them.",
       "npc0"
      ]
     ]
    },
    {
     "on": "mid",
     "s": [
      [
       null,
       "A gurney rolls out of the dark. Nobody pushing.",
       "wide",
       "silence"
      ],
      [
       "mid",
       "...",
       "mid",
       "shake"
      ],
      [
       "hero",
       "Security. He held the door for us. Then he stopped.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "midfin",
     "s": [
      [
       "hero",
       "His card still says HELP. I'll keep it.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "room:3",
     "s": [
      [
       "radio",
       "Courier here. Hospital roads are... ksshh... bad.",
       "hero",
       "static"
      ],
      [
       "radio",
       "I got bit on the hand in Da Nang. It's nothing. Keep moving.",
       "hero",
       "static"
      ],
      [
       "hero",
       "Bit. On the radio she sounds so calm.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "Theatre lamps snap on, one by one.",
       "wide",
       "flash"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "hero",
       "Still in his mask. Still operating.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "hero",
       "Ward nine is closed. Somebody write it down.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Account three. A nurse heard the bite on the radio.",
       "minh"
      ],
      [
       "minh",
       "I heard it on the tape twenty times before I believed it.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "walker",
    "runner",
    "spitter",
    "crawler",
    "riot",
    "screamer"
   ],
   "skins": [
    "nurse",
    "patient",
    "guard"
   ],
   "mid": {
    "r": 1,
    "hp": 12,
    "name": "THE ORDERLY",
    "atk": [
     "charge"
    ],
    "atk2": [
     "charge",
     "slam"
    ],
    "armor": 4,
    "p2": "His riot visor cracks. He stops guarding.",
    "fin": "The keycard on his chest still says HELP.",
    "drop": {
     "k": "herb"
    }
   },
   "npcs": [
    {
     "r": 2,
     "name": "DR. OKAFOR",
     "seed": 31,
     "lines": [
      "\"Nine floors. One working lift.\"",
      "\"Keep the fuses dry.\""
     ],
     "give": {
      "k": "herb"
     },
     "thanks": "\"Sedative-free. Clean. Go.\""
    },
    {
     "r": 2,
     "name": "PATIENT 14",
     "age": "elder",
     "seed": 35,
     "lines": [
      "\"I was here for my hip.\"",
      "\"Now I am here for the end of the world.\""
     ]
    }
   ],
   "camp": {
    "kind": "lantern",
    "fire": [
     80,
     96
    ],
    "bye": [
     "\"Doctors don't say goodbye. We say: keep the wound clean.\"",
     "\"Patient 14 is... discharged. Ha. Go.\""
    ],
    "req": {
     "who": 0,
     "text": "\"I need one herb to make a poultice for 14.\"",
     "need": {
      "k": "herb",
      "n": 1
     },
     "reward": {
      "k": "herb",
      "n": 2
     },
     "done": "\"Good. Take two; I grew them from your one. Medicine is strange.\""
    }
   }
  },
  {
   "id": 4,
   "title": "WHITE LINE",
   "place": "Altai, Kazakhstan",
   "who": "Yerlan Bekov, trucker",
   "weather": "snow",
   "mech": "cold",
   "memOpen": [
    "Before: Arman's 10th birthday.",
    "I promised I'd be home.",
    "I took one more haul.",
    "He stopped calling after.",
    "...",
    "At the pass we found a",
    "courier truck. Its logbook",
    "was still being written."
   ],
   "intro": [
    "\"Forty refugees in the",
    "convoy. Minus thirty.",
    "The lead truck stalled in",
    "the pass. Stay near fire.\""
   ],
   "outro": [
    "\"Chains on, diesel in, we",
    "crossed. In the courier",
    "truck's log, the same",
    "line, over and over:",
    "route clear. coming home.",
    "The ink was fresh.\""
   ],
   "rooms": [
    {
     "n": "STALLED CONVOY",
     "floor": "snow",
     "d": {
      "E": 1,
      "N": 3
     },
     "safe": true
    },
    {
     "n": "ROADSIDE CAFE",
     "floor": "wood",
     "d": {
      "W": 0,
      "E": 2
     },
     "safe": false
    },
    {
     "n": "FUEL DEPOT",
     "floor": "snow",
     "d": {
      "W": 1
     },
     "safe": false
    },
    {
     "n": "THE PASS",
     "floor": "snow",
     "d": {
      "S": 0,
      "N": 4
     },
     "safe": false
    },
    {
     "n": "SUMMIT",
     "floor": "snow",
     "d": {
      "S": 3,
      "N": "exit"
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 1,
     "k": "chains",
     "name": "Tire Chains"
    },
    {
     "r": 2,
     "k": "diesel",
     "name": "Diesel Can"
    },
    {
     "r": 1,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 2,
     "k": "herb"
    },
    {
     "r": 3,
     "k": "herb"
    },
    {
     "r": 0,
     "k": "ammo",
     "n": 4
    },
    {
     "r": 3,
     "k": "letter",
     "name": "Courier Logbook",
     "read": "Same line, page after page: \"route clear. coming home to M.\" The handwriting gets worse.",
     "mem": [
      "Arman asleep on my lap",
      "in the cab. Snow outside.",
      "Tea in a thermos."
     ]
    }
   ],
   "exit": {
    "r": 4,
    "needs": [
     "chains",
     "diesel"
    ],
    "locked": "The lead truck needs TIRE CHAINS and DIESEL.",
    "done": "The engine turns over in the cold."
   },
   "scares": [
    {
     "r": 1,
     "after": "chains",
     "type": "window"
    },
    {
     "r": 2,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    1,
    1,
    2,
    3,
    3,
    4
   ],
   "boss": {
    "r": 4,
    "hp": 18,
    "name": "THE PACK LEADER",
    "mech": "whiteout",
    "p2": "A whiteout rolls in. It hunts by smell now!",
    "memP2": [
     "Arman's voice message I",
     "never answered:",
     "\"Papa, are you coming?\""
    ],
    "memFin": [
     "Arman, age 4, in my hat,",
     "\"driving\" the truck.",
     "Warm. Safe. Before."
    ]
   },
   "extra": {},
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "hero",
       "Yerlan. I drive the Altai pass. Thirty winters.",
       "hero"
      ],
      [
       "hero",
       "My father's sheepskin. It has kept me alive before.",
       "hero"
      ],
      [
       null,
       "Snow fills the tracks behind you as you watch.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "Sit. There's tea. It's still warm.",
       "npc0"
      ],
      [
       "hero",
       "Aigerim. Where's the convoy?",
       "hero"
      ],
      [
       "npc0",
       "My brother drove it out. He came back on foot. Then he didn't come back.",
       "npc0"
      ]
     ]
    },
    {
     "on": "mid",
     "s": [
      [
       null,
       "Snares glint in the snow. Someone set them carefully.",
       "wide",
       "silence"
      ],
      [
       "mid",
       "...",
       "mid",
       "shake"
      ],
      [
       "hero",
       "A trapper. He's still hunting.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "midfin",
     "s": [
      [
       "hero",
       "His traps go slack. The pass is quiet again.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "room:2",
     "s": [
      [
       "radio",
       "Courier... cold here. Hands shaking. ksshh.",
       "hero",
       "static"
      ],
      [
       "radio",
       "My brother is a journalist. Smart kid. He'll be at the diner.",
       "hero",
       "static"
      ],
      [
       "hero",
       "Her voice sounds thinner every night.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "The wind stops. Completely.",
       "wide",
       "silence"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "hero",
       "The pack leader. Wearing the convoy's coats.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "hero",
       "The pass is open. Drive slow. Don't stop.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Account four. \"A journalist. Smart kid.\"",
       "minh"
      ],
      [
       "minh",
       "I wasn't smart. I was waiting at a diner for a truck.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "frozen",
    "frozen",
    "runner",
    "bloater",
    "screamer",
    "frozen"
   ],
   "skins": [
    "herder",
    "trucker",
    "civ"
   ],
   "mid": {
    "r": 2,
    "hp": 14,
    "name": "THE TRAPPER",
    "atk": [
     "spread"
    ],
    "atk2": [
     "spread",
     "ring"
    ],
    "p2": "Frost spreads from the snares. Keep moving!",
    "fin": "His traps go slack in the snow.",
    "drop": {
     "k": "ammo",
     "n": 8
    }
   },
   "npcs": [
    {
     "r": 1,
     "name": "AIGERIM",
     "seed": 41,
     "lines": [
      "\"The cafe still has tea. Sit.\"",
      "\"My brother drove the convoy.\""
     ],
     "give": {
      "k": "herb"
     },
     "thanks": "\"Warm tea, in a flask. For the pass.\""
    },
    {
     "r": 1,
     "name": "BEKZAT",
     "age": "kid",
     "seed": 44,
     "lines": [
      "\"I counted 200 crows.\"",
      "\"They all flew south.\""
     ]
    }
   ],
   "camp": {
    "kind": "campfire",
    "fire": [
     80,
     100
    ],
    "bye": [
     "\"The steppe takes everyone in the end. Not tonight.\"",
     "\"Ride safe, uncle. I'll keep the fire.\""
    ],
    "req": {
     "who": 1,
     "text": "\"Wolves - no, worse - circle the trucks. Thin them out. Four.\"",
     "kills": 4,
     "reward": {
      "k": "ammo",
      "n": 12
     },
     "done": "\"Grandfather would have liked you.\""
    }
   }
  },
  {
   "id": 5,
   "title": "SUB-LEVEL",
   "place": "Seoul, South Korea",
   "who": "Park Ji-woo, metro engineer",
   "weather": "drip",
   "mech": "sound",
   "memOpen": [
    "Before: Soo-ah's first train",
    "ride. Her face pressed",
    "to the glass, shouting",
    "\"So fast, Umma!\"",
    "...",
    "Down here the radio still",
    "reached. Courier repeated:",
    "\"...always come back...\""
   ],
   "intro": [
    "\"Two hundred commuters in",
    "the dark. The tunnel dwellers",
    "were blind. They hunted",
    "by sound. Move slow.\""
   ],
   "outro": [
    "\"The flood gate opened.",
    "We walked out into rain.",
    "The radio crackled once:",
    "'Minh... wait for my truck.'",
    "Then only static.\""
   ],
   "rooms": [
    {
     "n": "PLATFORM 4",
     "floor": "concrete",
     "d": {
      "E": 1,
      "N": 2
     },
     "safe": true
    },
    {
     "n": "TICKET HALL",
     "floor": "tile",
     "d": {
      "W": 0
     },
     "safe": false
    },
    {
     "n": "TUNNEL A",
     "floor": "concrete",
     "d": {
      "S": 0,
      "E": 3,
      "N": 4
     },
     "safe": false
    },
    {
     "n": "SIGNAL ROOM",
     "floor": "metal",
     "d": {
      "W": 2
     },
     "safe": false
    },
    {
     "n": "FLOOD GATE",
     "floor": "concrete",
     "d": {
      "S": 2,
      "N": "exit"
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 1,
     "k": "card",
     "name": "Keycard"
    },
    {
     "r": 3,
     "k": "breaker",
     "name": "Breaker Handle"
    },
    {
     "r": 1,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 3,
     "k": "herb"
    },
    {
     "r": 2,
     "k": "herb"
    },
    {
     "r": 0,
     "k": "ammo",
     "n": 4
    },
    {
     "r": 3,
     "k": "letter",
     "name": "Radio Tape",
     "read": "Courier, looping: \"...always come back... always... Minh, Minh, wait for my...\" The voice drags.",
     "mem": [
      "Soo-ah's small hand",
      "in mine on the escalator.",
      "\"Again, Umma! Again!\""
     ]
    }
   ],
   "exit": {
    "r": 4,
    "needs": [
     "card",
     "breaker"
    ],
    "locked": "The gate needs a KEYCARD and a BREAKER HANDLE.",
    "done": "The flood gate grinds open."
   },
   "scares": [
    {
     "r": 1,
     "after": "card",
     "type": "window"
    },
    {
     "r": 3,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    1,
    1,
    2,
    2,
    3,
    4
   ],
   "boss": {
    "r": 4,
    "hp": 18,
    "name": "THE LISTENER",
    "mech": "scream",
    "p2": "It screams. The others hear it!",
    "memP2": [
     "The night shift I took",
     "instead of her recital.",
     "Her empty seat photo."
    ],
    "memFin": [
     "Soo-ah asleep on the",
     "last train home,",
     "head on my arm. Before."
    ]
   },
   "extra": {},
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "hero",
       "Ji-woo. Subway engineer, Line 4.",
       "hero"
      ],
      [
       "hero",
       "Hi-vis on, hard hat on. Old habits.",
       "hero"
      ],
      [
       null,
       "Below the city, every sound carries.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "Shh. They don't see. They hear.",
       "npc0"
      ],
      [
       "hero",
       "Mr. Han. You're still selling tickets?",
       "hero"
      ],
      [
       "npc0",
       "Habit. Walk soft, child.",
       "npc0"
      ]
     ]
    },
    {
     "on": "mid",
     "s": [
      [
       null,
       "A lantern swings in the tunnel. Something calls the stops.",
       "wide",
       "silence"
      ],
      [
       "mid",
       "...",
       "mid",
       "shake"
      ],
      [
       "hero",
       "The night conductor. His train never came.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "midfin",
     "s": [
      [
       "hero",
       "The lantern goes out. Just a tunnel now.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "room:3",
     "s": [
      [
       "radio",
       "Courier. Wait for my truck. Wait for my... ksshh.",
       "hero",
       "static"
      ],
      [
       "radio",
       "...I can't remember the stop. I can't...",
       "hero",
       "static"
      ],
      [
       "hero",
       "She's forgetting. Over the air, she's forgetting.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "The flood gate hums. Everything else is silent.",
       "wide",
       "silence"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "hero",
       "It listens. Don't breathe.",
       "hero"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "hero",
       "Line 4 is clear. Last train out is us.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Account five. She forgot the stops.",
       "minh"
      ],
      [
       "minh",
       "She never forgot my name.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "runner",
    "crawler",
    "riot",
    "screamer",
    "spitter",
    "bloater"
   ],
   "skins": [
    "commuter",
    "worker",
    "commuter"
   ],
   "mid": {
    "r": 2,
    "hp": 12,
    "name": "THE CONDUCTOR",
    "atk": [
     "summon:runner",
     "blink"
    ],
    "atk2": [
     "blink",
     "ring"
    ],
    "p2": "He swings the lantern. Something answers from the tunnel.",
    "fin": "The lantern goes out. The tunnel is only a tunnel.",
    "drop": {
     "k": "herb"
    }
   },
   "npcs": [
    {
     "r": 1,
     "name": "MR. HAN",
     "age": "elder",
     "seed": 51,
     "lines": [
      "\"Thirty years I sold tickets here.\"",
      "\"Shh. They hear you.\""
     ],
     "give": {
      "k": "ammo",
      "n": 4
     },
     "thanks": "\"A guard left these. Quietly now.\""
    },
    {
     "r": 1,
     "name": "SORA",
     "seed": 55,
     "lines": [
      "\"I count trains. Habit.\"",
      "\"None since Tuesday.\""
     ]
    }
   ],
   "camp": {
    "kind": "lantern",
    "fire": [
     80,
     96
    ],
    "bye": [
     "\"Last train leaves when you do. Don't miss it.\"",
     "\"I'll stand where the signs are. So you can find us.\""
    ],
    "req": {
     "who": 0,
     "text": "\"The platform lights need wire. Three scraps.\"",
     "need": {
      "k": "scrap",
      "n": 3
     },
     "reward": {
      "k": "herb",
      "n": 2
     },
     "done": "\"Light. Real light. Take these.\""
    }
   }
  },
  {
   "id": 6,
   "title": "QUARANTINE CHOIR",
   "place": "Lisbon, Portugal",
   "who": "Tomas Ferreira, radio operator, 16",
   "weather": "storm",
   "mech": "siege",
   "memOpen": [
    "Before: Avo singing at",
    "the window every evening.",
    "We argued. I slammed the",
    "door. That was the last time.",
    "...",
    "Every night I answered",
    "Courier: \"Where are you?\"",
    "\"...on the route. For Minh.\""
   ],
   "intro": [
    "\"The lighthouse was the last",
    "tower with power. Every",
    "dead thing in the city",
    "followed the light.\""
   ],
   "outro": [
    "\"The transmitter worked.",
    "I read Courier's routes to",
    "the whole coast. Then a",
    "man named Minh called in.",
    "He asked about his sister.",
    "I told him the truth.\""
   ],
   "rooms": [
    {
     "n": "HARBOR STEPS",
     "floor": "stone",
     "d": {
      "N": 1,
      "E": 2
     },
     "safe": true
    },
    {
     "n": "OLD CHAPEL",
     "floor": "carpet",
     "d": {
      "S": 0,
      "N": 3
     },
     "safe": false
    },
    {
     "n": "FISH SHOP",
     "floor": "tile",
     "d": {
      "W": 0
     },
     "safe": false
    },
    {
     "n": "LIGHTHOUSE BASE",
     "floor": "stone",
     "d": {
      "S": 1,
      "E": 4,
      "N": 5
     },
     "safe": false
    },
    {
     "n": "STOREROOM",
     "floor": "wood",
     "d": {
      "W": 3
     },
     "safe": false
    },
    {
     "n": "LAMP ROOM",
     "floor": "metal",
     "d": {
      "S": 3,
      "N": "exit"
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 2,
     "k": "antenna",
     "name": "Antenna"
    },
    {
     "r": 4,
     "k": "battery",
     "name": "Car Battery"
    },
    {
     "r": 2,
     "k": "ammo",
     "n": 8
    },
    {
     "r": 1,
     "k": "herb"
    },
    {
     "r": 4,
     "k": "herb"
    },
    {
     "r": 3,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 1,
     "k": "letter",
     "name": "Logbook Page",
     "read": "Tomas's log: \"Courier calls at 3am now. She says her brother's name more than the roads.\"",
     "mem": [
      "Avo teaching me fado,",
      "laughing at my voice.",
      "Sardines on the roof."
     ]
    }
   ],
   "exit": {
    "r": 5,
    "needs": [
     "antenna",
     "battery"
    ],
    "locked": "The transmitter needs an ANTENNA and a BATTERY.",
    "done": "The transmitter warms up. Static, then voices."
   },
   "scares": [
    {
     "r": 2,
     "after": "antenna",
     "type": "window"
    },
    {
     "r": 4,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    0,
    1,
    1,
    2,
    3,
    4
   ],
   "boss": {
    "r": 5,
    "hp": 20,
    "name": "THE CHOIR",
    "mech": "waves",
    "p2": "The whole crowd climbs the stairs!",
    "memP2": [
     "The last thing Avo said:",
     "\"Come home for dinner.\"",
     "I didn't."
    ],
    "memFin": [
     "Avo and me on the roof,",
     "singing badly at the sea.",
     "Warm. Safe. Before."
    ]
   },
   "extra": {},
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "hero",
       "Tomas. Seventeen. Lisbon. I fix radios.",
       "hero"
      ],
      [
       "hero",
       "Headphones on so I don't hear the singing.",
       "hero"
      ],
      [
       null,
       "Salt wind. The lighthouse blinks in the wrong rhythm.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "The lighthouse blinks wrong.",
       "npc0"
      ],
      [
       "hero",
       "I know, Tiago. I'm fixing it.",
       "hero"
      ],
      [
       "npc0",
       "Promise?",
       "npc0"
      ],
      [
       "hero",
       "Promise.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "mid",
     "s": [
      [
       null,
       "Something wet sings a lullaby in the dark.",
       "wide",
       "silence"
      ],
      [
       "mid",
       "...",
       "mid",
       "shake"
      ],
      [
       "hero",
       "The matron from the chapel. Don't get close.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "midfin",
     "s": [
      [
       "hero",
       "She sleeps. The lullaby stops.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "room:4",
     "s": [
      [
       "radio",
       "ksshh... Minh... Minh, I'm on my way...",
       "hero",
       "static"
      ],
      [
       "radio",
       "...RRrrr... ksshh...",
       "hero",
       "static"
      ],
      [
       "hero",
       "That's not talking anymore. I told him. I told Minh.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "The choir begins. Every voice is wrong.",
       "wide",
       "silence"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "hero",
       "Hands over ears. Go.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "hero",
       "The light is right again. Ships will see it.",
       "hero",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Account six. Tomas called me. Said the Courier was growling.",
       "minh"
      ],
      [
       "minh",
       "I drove to Route 9 that night.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "drowned",
    "bloater",
    "spitter",
    "screamer",
    "runner",
    "riot"
   ],
   "skins": [
    "fisher",
    "civ",
    "market"
   ],
   "mid": {
    "r": 3,
    "hp": 14,
    "name": "THE MATRON",
    "atk": [
     "spread",
     "summon:bloater"
    ],
    "atk2": [
     "ring",
     "summon:bloater"
    ],
    "p2": "Her sacs split open. Do not stand close.",
    "fin": "She folds over, quiet, like a sleeper.",
    "drop": {
     "k": "ammo",
     "n": 10
    }
   },
   "npcs": [
    {
     "r": 2,
     "name": "DONA ROSA",
     "age": "elder",
     "seed": 61,
     "lines": [
      "\"I sang in that chapel once.\"",
      "\"Not that kind of choir.\""
     ],
     "give": {
      "k": "herb"
     },
     "thanks": "\"Rosemary and salt. Old cure.\""
    },
    {
     "r": 0,
     "name": "TIAGO",
     "age": "kid",
     "seed": 64,
     "lines": [
      "\"The lighthouse blinks wrong.\"",
      "\"Tomas said he'd fix it.\""
     ]
    }
   ],
   "camp": {
    "kind": "campfire",
    "fire": [
     64,
     96
    ],
    "bye": [
     "\"Sing something on the way down. They hate singing.\"",
     "\"Tiago will remember your face. He remembers everything.\""
    ],
    "req": {
     "who": 0,
     "text": "\"My grandson is hungry. Bring a herb, I'll make soup.\"",
     "need": {
      "k": "herb",
      "n": 1
     },
     "reward": {
      "k": "ammo",
      "n": 14
     },
     "done": "\"Soup and shells. Fair trade, no?\""
    }
   }
  },
  {
   "id": 7,
   "title": "THE INTERVIEWER",
   "place": "Route 9, end of the line",
   "who": "Minh Tran, interviewer",
   "weather": "ash",
   "mech": "final",
   "memOpen": [
    "Before: Chi Linh carrying me",
    "home from the noodle stall",
    "on her back, singing.",
    "\"I'll always come back.\"",
    "...",
    "Hollowmere. A scratch.",
    "Da Nang. A radio voice.",
    "Lagos. A folded jacket.",
    "Altai. A logbook.",
    "Seoul. \"Wait for my truck.\"",
    "Lisbon. \"I told him.\""
   ],
   "intro": [
    "\"Six accounts. One voice",
    "on the radio between them.",
    "I followed her route to",
    "the end. Her truck lights",
    "were on.\""
   ],
   "outro": [
    "\"I played the tape. Mom's",
    "voice first. Then hers:",
    "'Minh, I'm on my way.'",
    "She stopped. She knew me.",
    "She sat in her truck and",
    "the engine went quiet.",
    "I stayed until morning.",
    "She came back for me.",
    "She kept her promise.\"",
    "- Minh Tran, last account",
    "THE END"
   ],
   "rooms": [
    {
     "n": "HIGHWAY DINER",
     "floor": "tile",
     "d": {
      "E": 1
     },
     "safe": true
    },
    {
     "n": "GAS STATION",
     "floor": "concrete",
     "d": {
      "W": 0,
      "N": 2,
      "E": 3
     },
     "safe": false
    },
    {
     "n": "ROUTE 9",
     "floor": "concrete",
     "d": {
      "S": 1,
      "N": 4
     },
     "safe": false
    },
    {
     "n": "TRUCK STOP",
     "floor": "wood",
     "d": {
      "W": 1
     },
     "safe": false
    },
    {
     "n": "THE BRIDGE",
     "floor": "metal",
     "d": {
      "S": 2
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 3,
     "k": "tape",
     "name": "Voicemail Tape"
    },
    {
     "r": 0,
     "k": "player",
     "name": "Tape Player"
    },
    {
     "r": 1,
     "k": "ammo",
     "n": 8
    },
    {
     "r": 2,
     "k": "herb"
    },
    {
     "r": 3,
     "k": "herb"
    },
    {
     "r": 1,
     "k": "ammo",
     "n": 6
    },
    {
     "r": 2,
     "k": "letter",
     "name": "Linh's Last Note",
     "read": "\"If I don't make it, Minh, play Mom's message to me. I always stop for her voice.\"",
     "mem": [
      "Chi Linh teaching me",
      "to tie my shoes on",
      "the stall's steps."
     ]
    }
   ],
   "exit": null,
   "scares": [
    {
     "r": 3,
     "after": "tape",
     "type": "window"
    },
    {
     "r": 2,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    1,
    1,
    2,
    2,
    3
   ],
   "boss": {
    "r": 4,
    "hp": 24,
    "name": "COURIER",
    "mech": "final",
    "p2": "She speeds up. Headlights flare behind her!",
    "memP2": [
     "Linh's graduation. She",
     "picked me up and spun me.",
     "\"You next, little one.\""
    ],
    "memFin": [
     "Two kids eating noodles",
     "on the stall steps,",
     "Mom laughing. Before."
    ]
   },
   "extra": {
    "final": 1
   },
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "minh",
       "Minh Tran. I collect accounts.",
       "minh"
      ],
      [
       "minh",
       "Six survivors. One voice between them.",
       "minh"
      ],
      [
       null,
       "Route 9. Truck lights on, engine off.",
       "wide",
       "silence"
      ],
      [
       "minh",
       "Chi Linh. I'm here.",
       "minh",
       "swell"
      ]
     ]
    },
    {
     "on": "npc0",
     "s": [
      [
       "npc0",
       "A truck stops here every night.",
       "npc0"
      ],
      [
       "minh",
       "Red jacket? A satchel?",
       "minh"
      ],
      [
       "npc0",
       "She never eats. She just sits with the radio.",
       "npc0"
      ],
      [
       "minh",
       "That's her. That's my sister.",
       "minh",
       "swell"
      ]
     ]
    },
    {
     "on": "room:2",
     "s": [
      [
       "radio",
       "...ksshh... Minh... din... ner...",
       "minh",
       "static"
      ],
      [
       "minh",
       "The tape. Mom's voicemail. She'd remember that.",
       "minh"
      ],
      [
       null,
       "Headlights flare ahead. The engine starts by itself.",
       "wide",
       "flash"
      ]
     ]
    },
    {
     "on": "item:tape",
     "s": [
      [
       "minh",
       "Mom's last voicemail. Linh kept it in her satchel for years.",
       "minh",
       "swell"
      ],
      [
       null,
       "Far off, a horn. Three times. Like she used to.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "She steps out of the truck. Still wearing the jacket.",
       "boss",
       "silence"
      ],
      [
       "boss",
       "...Minh...",
       "boss",
       "shake"
      ],
      [
       "minh",
       "Chi Linh. It's me. You came back.",
       "minh"
      ],
      [
       "boss",
       "RRAAAGH",
       "boss",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "minh",
       "She stopped. She listened. Mom's voice, then hers.",
       "minh",
       "swell"
      ],
      [
       "linh",
       "Minh... I'm on my way. Always.",
       "minh",
       "swell"
      ],
      [
       null,
       "Her hand finds the steering wheel. The engine goes quiet.",
       "wide",
       "silence"
      ],
      [
       "minh",
       "I stayed until morning.",
       "minh",
       "swell"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Epilogue. The radio still crackles on Route 9.",
       "minh",
       "static"
      ],
      [
       "minh",
       "I talk back now. I tell people where it's safe.",
       "minh"
      ],
      [
       "minh",
       "This is Courier. Keep moving. Somebody is waiting for you.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "riot",
    "runner",
    "spitter",
    "screamer",
    "bloater"
   ],
   "skins": [
    "trucker",
    "civ",
    "guard"
   ],
   "npcs": [
    {
     "r": 0,
     "name": "THE COOK",
     "seed": 71,
     "lines": [
      "\"A truck stops here every night.\"",
      "\"Red jacket. She never eats.\""
     ],
     "give": {
      "k": "ammo",
      "n": 6
     },
     "thanks": "\"She left these for 'the kid with the recorder'.\""
    },
    {
     "r": 0,
     "name": "DAISY",
     "age": "kid",
     "seed": 74,
     "lines": [
      "\"The truck lady waved at me.\"",
      "\"She has a brother too.\""
     ]
    }
   ],
   "camp": {
    "kind": "lantern",
    "fire": [
     56,
     96
    ],
    "bye": [
     "\"Diner's closed. Go on, hon. Somebody's waiting.\"",
     "\"Daisy says bye. Daisy is a very good dog. Daisy is me.\""
    ],
    "req": {
     "who": 0,
     "text": "\"Grill's out. Clear the lot so I can get the generator. Five.\"",
     "kills": 5,
     "reward": {
      "k": "ammo",
      "n": 16
     },
     "done": "\"Order up. On the house.\""
    }
   }
  },
  {
   "id": 8,
   "title": "THE FIRST QUIET",
   "place": "Hollowmere House, after",
   "who": "Minh Tran, interviewer",
   "weather": "rain",
   "mech": "none",
   "memOpen": [
    "After: the radio is mine.",
    "Every night I read out",
    "the safe roads, like she did.",
    "One night, a voice answered",
    "from Hollowmere. No words.",
    "Only breathing."
   ],
   "intro": [
    "\"Secret account. I went back",
    "to the house where it began.",
    "The cellar stairs went",
    "further down than before.\""
   ],
   "outro": [
    "\"It never spoke. It only",
    "listened. When it fell,",
    "the rain sounded like rain",
    "again. I drove home.",
    "Somebody was waiting.\"",
    "- Minh Tran, closed account"
   ],
   "rooms": [
    {
     "n": "FOYER, AFTER",
     "floor": "tile",
     "d": {
      "N": 1
     },
     "safe": true
    },
    {
     "n": "STAIRS DOWN",
     "floor": "stone",
     "d": {
      "S": 0,
      "N": 2
     },
     "safe": false
    },
    {
     "n": "BELOW THE CELLAR",
     "floor": "stone",
     "d": {
      "S": 1
     },
     "safe": false
    }
   ],
   "items": [
    {
     "r": 0,
     "k": "ammo",
     "n": 16
    },
    {
     "r": 0,
     "k": "herb"
    },
    {
     "r": 1,
     "k": "herb"
    },
    {
     "r": 1,
     "k": "ammo",
     "n": 10
    }
   ],
   "exit": null,
   "scares": [
    {
     "r": 1,
     "type": "calm"
    }
   ],
   "enemyRooms": [
    1,
    1,
    1,
    2,
    2
   ],
   "boss": {
    "r": 2,
    "hp": 24,
    "name": "THE FIRST QUIET",
    "mech": "secret",
    "p2": "It folds into the dark. Watch the lamps.",
    "p3": "It opens. Every voice it ever heard comes out.",
    "memP2": [
     "Linh singing on the",
     "walk home. Off key."
    ],
    "memFin": [
     "Route 9 at dawn.",
     "A truck. A promise kept."
    ]
   },
   "extra": {
    "secret": 1
   },
   "scenes": [
    {
     "on": "start",
     "s": [
      [
       "minh",
       "After. Hollowmere House again. The cellar is open.",
       "minh",
       "silence"
      ],
      [
       "minh",
       "Something was here before Mr. Addo. Before any of it.",
       "minh"
      ],
      [
       null,
       "The quiet has a shape.",
       "wide",
       "silence"
      ]
     ]
    },
    {
     "on": "boss",
     "s": [
      [
       null,
       "Every lamp in the house dies at once.",
       "wide",
       "silence"
      ],
      [
       "boss",
       "...",
       "boss",
       "shake"
      ],
      [
       "minh",
       "It doesn't breathe. It listens to us breathe.",
       "minh",
       "swell"
      ]
     ]
    },
    {
     "on": "bossfin",
     "s": [
      [
       "minh",
       "The first quiet ends. Only rain now.",
       "minh",
       "swell"
      ],
      [
       "minh",
       "Account closed.",
       "minh"
      ]
     ]
    },
    {
     "on": "end",
     "s": [
      [
       "minh",
       "Thank you for listening. Keep moving.",
       "minh",
       "swell"
      ]
     ]
    }
   ],
   "mix": [
    "runner",
    "riot",
    "spitter",
    "frozen",
    "drowned",
    "screamer"
   ],
   "skins": [
    "civ",
    "commuter",
    "nurse"
   ],
   "npcs": [],
   "camp": {
    "kind": "lantern",
    "fire": [
     80,
     90
    ],
    "bye": [
     "\"...\""
    ],
    "req": {
     "who": 0,
     "text": "",
     "kills": 3,
     "reward": {
      "k": "ammo",
      "n": 6
     },
     "done": ""
    }
   }
  }
 ]
};
