import json
import os

SEMESTER_START = "2026-08-29"
SEMESTER_END = "2026-11-29"

PERIOD_TIMINGS = {
    "FN": [
        {"period": 1, "time": "09:00 - 09:50"},
        {"period": 2, "time": "09:50 - 10:40"},
        {"period": 3, "time": "10:50 - 11:40"},
        {"period": 4, "time": "11:40 - 12:30"},
        {"period": 5, "time": "12:30 - 01:20", "isLunch": True},
        {"period": 6, "time": "01:20 - 02:10"},
        {"period": 7, "time": "02:10 - 03:00"},
        {"period": 8, "time": "03:10 - 04:00"},
        {"period": 9, "time": "04:00 - 04:50"},
    ],
    "AN": [
        {"period": 1, "time": "09:00 - 09:50"},
        {"period": 2, "time": "09:50 - 10:40"},
        {"period": 3, "time": "10:50 - 11:40"},
        {"period": 4, "time": "11:40 - 12:30"},
        {"period": 5, "time": "12:30 - 01:20", "isLunch": True},
        {"period": 6, "time": "01:20 - 02:10"},
        {"period": 7, "time": "02:10 - 03:00"},
        {"period": 8, "time": "03:10 - 04:00"},
        {"period": 9, "time": "04:00 - 04:50"},
    ],
    "I_YEAR": [
        {"period": 1, "time": "09:00 - 09:50"},
        {"period": 2, "time": "09:55 - 10:45"},
        {"period": 3, "time": "10:50 - 11:40"},
        {"period": 4, "time": "11:45 - 12:35"},
        {"period": 5, "time": "12:35 - 01:30", "isLunch": True},
        {"period": 6, "time": "01:30 - 02:20"},
        {"period": 7, "time": "02:25 - 03:15"},
        {"period": 8, "time": "03:20 - 04:10"},
        {"period": 9, "time": "04:15 - 05:05"},
    ]
}

sections = [
    # 1. III ECE B
    {
        "id": "III-ECE-B",
        "name": "III ECE B",
        "batch": "III-Year-ECE_B Section / V Semester",
        "venue": "IST 518/AN",
        "timingType": "AN",
        "periods": PERIOD_TIMINGS["AN"],
        "subjects": [
            {
                "code": "21MAB302T",
                "name": "Discrete Mathematics",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "Dr. M. Thanga Rejini",
                "designation": "AP/Maths",
                "schedule": [
                    {"day": "Monday", "periods": [8]},
                    {"day": "Wednesday", "periods": [8]},
                    {"day": "Thursday", "periods": [6]},
                    {"day": "Friday", "periods": [7]}
                ]
            },
            {
                "code": "21ECC301P",
                "name": "Microprocessor, Microcontroller, and Interfacing Techniques",
                "slot": "B",
                "credit": "3-1-0-4",
                "faculty": "Mrs. B. Abirami",
                "designation": "EO/SRMIST",
                "schedule": [
                    {"day": "Monday", "periods": [7]},
                    {"day": "Tuesday", "periods": [7]},
                    {"day": "Wednesday", "periods": [6, 7]}  # includes B-Proj
                ]
            },
            {
                "code": "21ECC303T",
                "name": "VLSI Design and Technology",
                "slot": "C",
                "credit": "3-0-0-3",
                "faculty": "Dr. R. Vinoth Raj",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Tuesday", "periods": [9]},
                    {"day": "Thursday", "periods": [7]},
                    {"day": "Friday", "periods": [6]}
                ]
            },
            {
                "code": "21ECE468T",
                "name": "System and Network on Chip",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. V. Manikandan",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Monday", "periods": [9]},
                    {"day": "Tuesday", "periods": [8]},
                    {"day": "Friday", "periods": [9]}
                ]
            },
            {
                "code": "21CSO355T",
                "name": "Machine learning for all",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. J. Jencia",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Monday", "periods": [6]},
                    {"day": "Thursday", "periods": [8]},
                    {"day": "Friday", "periods": [8]}
                ]
            },
            {
                "code": "21GNP301L",
                "name": "Community connect",
                "slot": "F",
                "credit": "0-0-2-1",
                "faculty": "Dr. H. Sudharsan / Ms. T. Swetha",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [6]},
                    {"day": "Thursday", "periods": [9]}
                ]
            },
            {
                "code": "21PDM301L",
                "name": "Analytical and logical thinking skills",
                "slot": "G",
                "credit": "0-0-2-0",
                "faculty": "CDC - 625",
                "designation": "CDC",
                "schedule": [
                    {"day": "Tuesday", "periods": [1, 2]},
                    {"day": "Wednesday", "periods": [1]}
                ]
            },
            {
                "code": "21LEM301T",
                "name": "Indian Art Form",
                "slot": "H",
                "credit": "1-0-0-0",
                "faculty": "Dr. A. Anand",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [9]}
                ]
            },
            {
                "code": "21ECC311L",
                "name": "VLSI Design/ Microprocessor Laboratory",
                "slot": "LAB",
                "credit": "0-0-4-2",
                "faculty": "Dr. Sreenivasa Ijada Rao / Dr. B. DeviSri & Dr. Prasanna Venkatesh",
                "designation": "Prof. /ECE, AP / ECE, AP / BME",
                "schedule": [
                    {"day": "Monday", "periods": [1, 2]},
                    {"day": "Thursday", "periods": [1, 2]}
                ]
            }
        ]
    },

    # 2. III ECE A
    {
        "id": "III-ECE-A",
        "name": "III ECE A",
        "batch": "III -Year-ECE_A Section / V Semester",
        "venue": "IST 518/FN",
        "timingType": "FN",
        "periods": PERIOD_TIMINGS["FN"],
        "subjects": [
            {
                "code": "21MAB302T",
                "name": "Discrete Mathematics",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "New Faculty 3",
                "designation": "AP/Maths",
                "schedule": [
                    {"day": "Monday", "periods": [4]},
                    {"day": "Wednesday", "periods": [2]},
                    {"day": "Thursday", "periods": [1]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21ECC301P",
                "name": "Microprocessor, Microcontroller, and Interfacing Techniques",
                "slot": "B",
                "credit": "3-1-0-4",
                "faculty": "Dr. M. Manikandan",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [2, 3]},
                    {"day": "Tuesday", "periods": [3, 4]}  # P4 is B-Proj
                ]
            },
            {
                "code": "21ECC303T",
                "name": "VLSI Design and Technology",
                "slot": "C",
                "credit": "3-0-0-3",
                "faculty": "Dr. M. Jothi",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [1]},
                    {"day": "Thursday", "periods": [3]},
                    {"day": "Friday", "periods": [4]}
                ]
            },
            {
                "code": "21ECE468T",
                "name": "System and Network on Chip",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. V. Manikandan",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Wednesday", "periods": [3]},
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21CSO355T",
                "name": "Machine learning for all",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. J. Jencia",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Monday", "periods": [1]},
                    {"day": "Thursday", "periods": [2]},
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21GNP301L",
                "name": "Community connect",
                "slot": "F",
                "credit": "0-0-2-1",
                "faculty": "Dr. V .Rajesh / Dr. V.Bharathi",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [4]},
                    {"day": "Thursday", "periods": [4]}
                ]
            },
            {
                "code": "21PDM301L",
                "name": "Analytical and logical thinking skills",
                "slot": "G",
                "credit": "0-0-2-0",
                "faculty": "CDC / 625",
                "designation": "CDC",
                "schedule": [
                    {"day": "Monday", "periods": [6, 7]},
                    {"day": "Tuesday", "periods": [7]}
                ]
            },
            {
                "code": "21LEM301T",
                "name": "Indian Art Form",
                "slot": "H",
                "credit": "1-0-0-0",
                "faculty": "Dr. K. Vigneshwaran",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [1]}
                ]
            },
            {
                "code": "21ECC311L",
                "name": "VLSI Design/ Microprocessor Laboratory",
                "slot": "LAB",
                "credit": "0-0-4-2",
                "faculty": "Dr. M. Jothi & Dr. P. Murugapandiyan / Dr. V. Manikandan",
                "designation": "AP/ECE, Prof./ECE, AP/ECE-DS",
                "schedule": [
                    {"day": "Wednesday", "periods": [8, 9]},
                    {"day": "Friday", "periods": [6, 7]}
                ]
            }
        ]
    },

    # 3. III ECE DS
    {
        "id": "III-ECE-DS",
        "name": "III ECE DS",
        "batch": "III -Year-ECE_DS / V Semester",
        "venue": "IST 519/FN",
        "timingType": "FN",
        "periods": PERIOD_TIMINGS["FN"],
        "subjects": [
            {
                "code": "21MAB302T",
                "name": "Discrete Mathematics",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "New faculty 2",
                "designation": "AP/Maths",
                "schedule": [
                    {"day": "Monday", "periods": [4]},
                    {"day": "Wednesday", "periods": [3]},
                    {"day": "Thursday", "periods": [1]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21ECC301P",
                "name": "Microprocessor, Microcontroller, and Interfacing Techniques",
                "slot": "B",
                "credit": "3-1-0-4",
                "faculty": "Mrs. B. Abirami",
                "designation": "EO/SRMIST",
                "schedule": [
                    {"day": "Monday", "periods": [2]},
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Wednesday", "periods": [2]},
                    {"day": "Friday", "periods": [4]}  # B-Proj
                ]
            },
            {
                "code": "21ECC303T",
                "name": "VLSI Design and Technology",
                "slot": "C",
                "credit": "3-0-0-3",
                "faculty": "Dr. R. Vinoth Raj",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Monday", "periods": [3]},
                    {"day": "Tuesday", "periods": [1]},
                    {"day": "Wednesday", "periods": [4]}
                ]
            },
            {
                "code": "21CSO355T",
                "name": "Machine learning for all",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. Dr. Chitra Devi",
                "designation": "ASP/SoC",
                "schedule": [
                    {"day": "Tuesday", "periods": [3]},
                    {"day": "Thursday", "periods": [2]},
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21ECE371T",
                "name": "Database Design and Management",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. S. Saraswathi",
                "designation": "AP/SoC",
                "schedule": [
                    {"day": "Monday", "periods": [1]},
                    {"day": "Thursday", "periods": [3]},
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21GNP301L",
                "name": "Community connect",
                "slot": "F",
                "credit": "0-0-2-1",
                "faculty": "Dr. S. Jeevanantham / Dr. V. Manikandan",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Tuesday", "periods": [4]},
                    {"day": "Thursday", "periods": [4]}
                ]
            },
            {
                "code": "21PDM301L",
                "name": "Analytical and logical thinking skills",
                "slot": "G",
                "credit": "0-0-2-0",
                "faculty": "CDC-625",
                "designation": "CDC",
                "schedule": [
                    {"day": "Wednesday", "periods": [8, 9]},
                    {"day": "Friday", "periods": [6]}
                ]
            },
            {
                "code": "21LEM301T",
                "name": "Indian Art Form",
                "slot": "H",
                "credit": "1-0-0-0",
                "faculty": "Dr. Prabin Kumar Bera",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [1]}
                ]
            },
            {
                "code": "21ECC311L",
                "name": "VLSI Design/ Microprocessor Laboratory",
                "slot": "LAB",
                "credit": "0-0-4-2",
                "faculty": "Dr. R. Vinothraj / Dr. H. Sri Bhuvaneshwari",
                "designation": "AP/ECE DS, AP/ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [6, 7]},
                    {"day": "Friday", "periods": [8, 9]}
                ]
            }
        ]
    },

    # 4. III BME
    {
        "id": "III-BME",
        "name": "III BME",
        "batch": "III -Year-BME / V Semester",
        "venue": "IST 211 / AN",
        "timingType": "AN",
        "periods": PERIOD_TIMINGS["AN"],
        "subjects": [
            {
                "code": "21MAB301T",
                "name": "Probability and Statistics",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "Dr. K. M. Karuppusamy",
                "designation": "AP/Maths",
                "schedule": [
                    {"day": "Tuesday", "periods": [8]},
                    {"day": "Wednesday", "periods": [7]},
                    {"day": "Thursday", "periods": [6]},
                    {"day": "Friday", "periods": [7]}
                ]
            },
            {
                "code": "21BMC302J",
                "name": "Microcontrollers and Its Application in Medicine",
                "slot": "B",
                "credit": "3-0-2-4",
                "faculty": "Dr. K. Vigneshwaran",
                "designation": "ASP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [3, 4, 7]},  # 3,4 MPMC Lab, 7 Theory B
                    {"day": "Tuesday", "periods": [9]},
                    {"day": "Thursday", "periods": [9]}
                ]
            },
            {
                "code": "21BMC301J",
                "name": "Biomedical Signal Processing",
                "slot": "C",
                "credit": "3-0-2-4",
                "faculty": "Dr. V.N. Senthilkumaran",
                "designation": "ASP & HOD / ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [1, 2, 6]},  # 1,2 BIO DSP Lab, 6 Theory C
                    {"day": "Wednesday", "periods": [6]},
                    {"day": "Thursday", "periods": [7]}
                ]
            },
            {
                "code": "21BME266T",
                "name": "Biometrics",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. G. Gifta",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Tuesday", "periods": [7]},
                    {"day": "Wednesday", "periods": [9]},
                    {"day": "Friday", "periods": [8]}
                ]
            },
            {
                "code": "21ECO103T",
                "name": "Modern wireless communication system",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. Vaishnavi",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [6]},
                    {"day": "Thursday", "periods": [8]},
                    {"day": "Friday", "periods": [9]}
                ]
            },
            {
                "code": "21BMC303T",
                "name": "Principles of Medical Imaging",
                "slot": "F",
                "credit": "3-0-0-3",
                "faculty": "Dr. N. Prasana venkatesh",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Monday", "periods": [8]},
                    {"day": "Wednesday", "periods": [8]},
                    {"day": "Friday", "periods": [6]}
                ]
            },
            {
                "code": "21PDM301L",
                "name": "Analytical and Logical Thinking Skills",
                "slot": "G",
                "credit": "0-0-2-0",
                "faculty": "CDC-625",
                "designation": "CDC",
                "schedule": [
                    {"day": "Monday", "periods": [1, 2]},
                    {"day": "Tuesday", "periods": [3]}
                ]
            },
            {
                "code": "21LEM301T",
                "name": "Indian Art Form",
                "slot": "H",
                "credit": "1-0-0-0",
                "faculty": "Dr. G. Gifta",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Monday", "periods": [9]}
                ]
            },
            {
                "code": "21GNP301L",
                "name": "Community Connect",
                "slot": "I",
                "credit": "0-0-2-1",
                "faculty": "Dr. J. Jencia / Dr. N. Prasanna Venkatesh",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Thursday", "periods": [4]},
                    {"day": "Friday", "periods": [1, 2]}
                ]
            }
        ]
    },

    # 5. II BME
    {
        "id": "II-BME",
        "name": "II BME",
        "batch": "II -Year-BME / III Semester",
        "venue": "IST 602 / FN",
        "timingType": "FN",
        "periods": PERIOD_TIMINGS["FN"],
        "subjects": [
            {
                "code": "21MAB201T",
                "name": "Transforms and Boundary Value Problems",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "Dr. A. Manickam",
                "designation": "ASP/MAT",
                "schedule": [
                    {"day": "Tuesday", "periods": [4]},
                    {"day": "Wednesday", "periods": [3]},
                    {"day": "Thursday", "periods": [1]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21BMC202T",
                "name": "Biomedical Signals and Systems",
                "slot": "B",
                "credit": "3-0-0-3",
                "faculty": "Dr. Senthil Kumaran V N",
                "designation": "ASP & HOD / ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [3]},
                    {"day": "Wednesday", "periods": [1]},
                    {"day": "Thursday", "periods": [3]}
                ]
            },
            {
                "code": "21BMC203J",
                "name": "Electric and Electronic Circuits",
                "slot": "C",
                "credit": "3-0-2-4",
                "faculty": "Dr. Prabin Kumar Bera",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [2, 6, 7]},  # 2 is theory C, 6,7 is DLMS/EEC Lab
                    {"day": "Tuesday", "periods": [1]},
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21BMC204J",
                "name": "Digital Logic for Medical Systems",
                "slot": "D",
                "credit": "2-0-2-3",
                "faculty": "Dr. G. Gifta",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Wednesday", "periods": [2]},
                    {"day": "Thursday", "periods": [4, 8, 9]},  # 4 is theory D, 8,9 is Lab
                    {"day": "Friday", "periods": [4]}
                ]
            },
            {
                "code": "21PYS202T",
                "name": "Medical Physics",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. D. Rajeswari",
                "designation": "ASP/PHY",
                "schedule": [
                    {"day": "Monday", "periods": [1]},
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Thursday", "periods": [2]}
                ]
            },
            {
                "code": "21LEM201T",
                "name": "Professional Ethics",
                "slot": "F",
                "credit": "1-0-0-0",
                "faculty": "Dr. H. SriBhuvaneshwari",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21LEM202T",
                "name": "Universal Human Values-II",
                "slot": "G",
                "credit": "2-1-0-3",
                "faculty": "Mrs. N. Suganthi",
                "designation": "RS - ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [7]},
                    {"day": "Friday", "periods": [8, 9]}
                ]
            },
            {
                "code": "21PDM201L",
                "name": "Verbal Reasoning",
                "slot": "H",
                "credit": "0-0-2-0",
                "faculty": "CDC-TB-106",
                "designation": "CDC",
                "schedule": [
                    {"day": "Tuesday", "periods": [6, 7]},
                    {"day": "Wednesday", "periods": [6]}
                ]
            },
            {
                "code": "21PDH201T",
                "name": "Social Engineering",
                "slot": "I",
                "credit": "2-0-0-2",
                "faculty": "Mrs. Francis Arockiya Mary",
                "designation": "RS - EEE",
                "schedule": [
                    {"day": "Monday", "periods": [3, 4]}
                ]
            }
        ]
    },

    # 6. II ECE DS A
    {
        "id": "II-ECE-DS-A",
        "name": "II ECE DS A",
        "batch": "II -Year-DS-A / III Semester",
        "venue": "IST 416 / FN",
        "timingType": "FN",
        "periods": PERIOD_TIMINGS["FN"],
        "subjects": [
            {
                "code": "21MAB201T",
                "name": "Transforms and Boundary Value Problems",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "Dr. C. Arun Kumar",
                "designation": "AP/Maths",
                "schedule": [
                    {"day": "Monday", "periods": [2]},
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Wednesday", "periods": [1]},
                    {"day": "Thursday", "periods": [3]}
                ]
            },
            {
                "code": "21ECC201T",
                "name": "Solid State Devices",
                "slot": "B",
                "credit": "3-0-0-3",
                "faculty": "Dr. Jeevanantham S",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Wednesday", "periods": [2]},
                    {"day": "Thursday", "periods": [1]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21CSS201T",
                "name": "Computer Organization and Architecture",
                "slot": "C",
                "credit": "3-1-0-4",
                "faculty": "Dr. P. Murugapandiyan",
                "designation": "Prof./ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [1]},
                    {"day": "Wednesday", "periods": [3]},
                    {"day": "Thursday", "periods": [2]},
                    {"day": "Friday", "periods": [4]}
                ]
            },
            {
                "code": "21ECC203T",
                "name": "Digital Logic Design",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. S. Krishnakumar",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Tuesday", "periods": [4]},
                    {"day": "Wednesday", "periods": [4]},
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21ECC205T",
                "name": "Electromagnetic Theory and Interference",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. V. Bharathi",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [1]},
                    {"day": "Tuesday", "periods": [3]},
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21LEM201T",
                "name": "Professional Ethics",
                "slot": "F",
                "credit": "1-0-0-0",
                "faculty": "Dr. Jothi M",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Thursday", "periods": [4]}
                ]
            },
            {
                "code": "21LEM202T",
                "name": "Universal Human Values-II",
                "slot": "G",
                "credit": "2-1-0-3",
                "faculty": "Mrs. N. Suganthi",
                "designation": "RS - ECE",
                "schedule": [
                    {"day": "Monday", "periods": [6, 7]},
                    {"day": "Tuesday", "periods": [6]}
                ]
            },
            {
                "code": "21PDM201L",
                "name": "Verbal Reasoning",
                "slot": "H",
                "credit": "0-0-2-0",
                "faculty": "CDC – TB -106",
                "designation": "CDC",
                "schedule": [
                    {"day": "Tuesday", "periods": [8, 9]},
                    {"day": "Wednesday", "periods": [7]}
                ]
            },
            {
                "code": "21PDH209T",
                "name": "Social Engineering",
                "slot": "I",
                "credit": "2-0-0-2",
                "faculty": "Mrs. D. Lavanya",
                "designation": "RS - ECE",
                "schedule": [
                    {"day": "Monday", "periods": [3, 4]}
                ]
            },
            {
                "code": "21ECC211L",
                "name": "Devices and Digital IC Laboratory",
                "slot": "LAB",
                "credit": "0-0-4-2",
                "faculty": "Dr. Jeevanantham S / Dr. V. Bharathi",
                "designation": "AP/ECE-DS, AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [8, 9]},
                    {"day": "Thursday", "periods": [6, 7]}
                ]
            }
        ]
    },

    # 7. II ECE DS B
    {
        "id": "II-ECE-DS-B",
        "name": "II ECE DS B",
        "batch": "II -Year-DS-B / III Semester",
        "venue": "IST 411/ AN",
        "timingType": "AN",
        "periods": PERIOD_TIMINGS["AN"],
        "subjects": [
            {
                "code": "21MAB201T",
                "name": "Transforms and Boundary Value Problems",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "NEW FACULTY 3",
                "designation": "AP/MAT",
                "schedule": [
                    {"day": "Tuesday", "periods": [9]},
                    {"day": "Wednesday", "periods": [8]},
                    {"day": "Thursday", "periods": [6]},
                    {"day": "Friday", "periods": [7]}
                ]
            },
            {
                "code": "21ECC201T",
                "name": "Solid State Devices",
                "slot": "B",
                "credit": "3-0-0-3",
                "faculty": "Dr. Jeevanantham S",
                "designation": "AP/ECE DS",
                "schedule": [
                    {"day": "Monday", "periods": [7]},
                    {"day": "Thursday", "periods": [8]},
                    {"day": "Friday", "periods": [8]}
                ]
            },
            {
                "code": "21CSS201T",
                "name": "Computer Organization and Architecture",
                "slot": "C",
                "credit": "3-1-0-4",
                "faculty": "Dr. P. Murugapandiyan",
                "designation": "Prof./ECE",
                "schedule": [
                    {"day": "Monday", "periods": [8]},
                    {"day": "Tuesday", "periods": [6]},
                    {"day": "Thursday", "periods": [7]},
                    {"day": "Friday", "periods": [9]}
                ]
            },
            {
                "code": "21ECC203T",
                "name": "Digital Logic Design",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. S. Krishnakumar",
                "designation": "AP/ECE DS",
                "schedule": [
                    {"day": "Monday", "periods": [6]},
                    {"day": "Tuesday", "periods": [7]},
                    {"day": "Wednesday", "periods": [9]}
                ]
            },
            {
                "code": "21ECC205T",
                "name": "Electromagnetic Theory and Interference",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. V. Bharathi",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [8]},
                    {"day": "Wednesday", "periods": [7]},
                    {"day": "Thursday", "periods": [9]}
                ]
            },
            {
                "code": "21LEM201T",
                "name": "Professional Ethics",
                "slot": "F",
                "credit": "1-0-0-0",
                "faculty": "Dr. K. Vigneshwaran",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Friday", "periods": [6]}
                ]
            },
            {
                "code": "21LEM202T",
                "name": "Universal Human Values-II",
                "slot": "G",
                "credit": "2-1-0-3",
                "faculty": "Mrs. D. Lavanya",
                "designation": "RS - ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [1]},
                    {"day": "Thursday", "periods": [2]}
                ]
            },
            {
                "code": "21PDM201L",
                "name": "Verbal Reasoning",
                "slot": "H",
                "credit": "0-0-2-0",
                "faculty": "CDC-TB-106",
                "designation": "CDC",
                "schedule": [
                    {"day": "Thursday", "periods": [3, 4]},
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21PDH209T",
                "name": "Social Engineering",
                "slot": "I",
                "credit": "2-0-0-2",
                "faculty": "Mrs. D. Lavanya",
                "designation": "RS - ECE",
                "schedule": [
                    {"day": "Monday", "periods": [9]},
                    {"day": "Wednesday", "periods": [6]}
                ]
            },
            {
                "code": "21ECC211L",
                "name": "Devices and Digital IC Laboratory",
                "slot": "LAB",
                "credit": "0-0-4-2",
                "faculty": "Dr. S. Krishnakumar",
                "designation": "AP/ECE DS",
                "schedule": [
                    {"day": "Monday", "periods": [3, 4]},
                    {"day": "Tuesday", "periods": [1, 2]}
                ]
            }
        ]
    },

    # 8. IV ECE A
    {
        "id": "IV-ECE-A",
        "name": "IV ECE A",
        "batch": "IV -Year-ECE_A Section /VII Semester",
        "venue": "IST 225",
        "timingType": "FN",
        "periods": PERIOD_TIMINGS["FN"],
        "subjects": [
            {
                "code": "21GNH401T",
                "name": "Behavioural Psychology",
                "slot": "A",
                "credit": "2-1-0-3",
                "faculty": "Dr. A. Anand",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [3]},
                    {"day": "Thursday", "periods": [2]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21ECC401T",
                "name": "Wireless Communication and Antenna Systems",
                "slot": "B",
                "credit": "3-0-0-3",
                "faculty": "Dr. K. Vigneshwaran",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [3]},
                    {"day": "Wednesday", "periods": [1]},
                    {"day": "Thursday", "periods": [4]}
                ]
            },
            {
                "code": "21ECC402P",
                "name": "Computer Communication and Network Security",
                "slot": "C",
                "credit": "2-1-0-3",
                "faculty": "Dr. S. Jeevanantham",
                "designation": "AP/ECE-DS",
                "schedule": [
                    {"day": "Monday", "periods": [1]},
                    {"day": "Tuesday", "periods": [1]},
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21ECE461T",
                "name": "Semiconductor Memory Design",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. H. SriBhuvaneshwari",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [4]},
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21ECE463T",
                "name": "Scripting Language for Electronic Design Automation",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. Sreenivasa Rao Ijada",
                "designation": "Prof/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [3]},
                    {"day": "Thursday", "periods": [3]},
                    {"day": "Friday", "periods": [4]}
                ]
            },
            {
                "code": "21CSO355T",
                "name": "Machine learning for all",
                "slot": "F",
                "credit": "3-0-0-3",
                "faculty": "Dr. N. Prasanna Venkatesh",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Tuesday", "periods": [4]},
                    {"day": "Wednesday", "periods": [4]},
                    {"day": "Thursday", "periods": [1]}
                ]
            },
            {
                "code": "21ECC402P_LAB",
                "name": "Computer Communication and Network Security Laboratory",
                "slot": "LAB",
                "credit": "2-1-0-3",
                "faculty": "Mrs. T. Swetha",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [2]}
                ]
            }
        ]
    },

    # 9. IV ECE B
    {
        "id": "IV-ECE-B",
        "name": "IV ECE B",
        "batch": "IV -Year-ECE_B Section /VII Semester",
        "venue": "IST 227",
        "timingType": "FN",
        "periods": PERIOD_TIMINGS["FN"],
        "subjects": [
            {
                "code": "21GNH401T",
                "name": "Behavioural Psychology",
                "slot": "A",
                "credit": "2-1-0-3",
                "faculty": "Dr. A. Annand",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [2]},
                    {"day": "Wednesday", "periods": [3]},
                    {"day": "Thursday", "periods": [4]}
                ]
            },
            {
                "code": "21ECC401T",
                "name": "Wireless Communication and Antenna Systems",
                "slot": "B",
                "credit": "3-0-0-3",
                "faculty": "Dr. K. Vigneshwaran",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Tuesday", "periods": [4]},
                    {"day": "Wednesday", "periods": [4]},
                    {"day": "Thursday", "periods": [2]}
                ]
            },
            {
                "code": "21ECC402P",
                "name": "Computer Communication and Network Security",
                "slot": "C",
                "credit": "2-1-0-3",
                "faculty": "Dr. R. Rajasekar",
                "designation": "ASP & HOD ECE - DS",
                "schedule": [
                    {"day": "Monday", "periods": [1]},
                    {"day": "Tuesday", "periods": [1]},
                    {"day": "Wednesday", "periods": [1]}
                ]
            },
            {
                "code": "21ECE461T",
                "name": "Semiconductor Memory Design",
                "slot": "D",
                "credit": "3-0-0-3",
                "faculty": "Dr. H. SriBhuvaneshwari",
                "designation": "AP/ECE",
                "schedule": [
                    {"day": "Wednesday", "periods": [2]},
                    {"day": "Thursday", "periods": [1]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21ECE463T",
                "name": "Scripting Language for Electronic Design Automation",
                "slot": "E",
                "credit": "3-0-0-3",
                "faculty": "Dr. Sreenivasa Rao Ijada",
                "designation": "Prof/ECE",
                "schedule": [
                    {"day": "Monday", "periods": [3]},
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21CSO355T",
                "name": "Machine learning for all",
                "slot": "F",
                "credit": "3-0-0-3",
                "faculty": "Dr. N. Prasanna Venkatesh",
                "designation": "AP/BME",
                "schedule": [
                    {"day": "Monday", "periods": [4]},
                    {"day": "Tuesday", "periods": [3]},
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21ECC402P_LAB",
                "name": "Computer Communication and Network Security Laboratory",
                "slot": "LAB",
                "credit": "2-1-0-3",
                "faculty": "Ms. T. Swetha",
                "designation": "AP / ECE",
                "schedule": [
                    {"day": "Thursday", "periods": [3]}
                ]
            }
        ]
    },

    # 10. I ECE A
    {
        "id": "I-ECE-A",
        "name": "I ECE A",
        "batch": "Year / Sem / Sec: I / I / ECE - A",
        "venue": "IST 602 / IST 710",
        "timingType": "I_YEAR",
        "periods": PERIOD_TIMINGS["I_YEAR"],
        "subjects": [
            {
                "code": "21MAB102T",
                "name": "Advanced Calculus and Complex Analysis",
                "slot": "A",
                "credit": "3-1-0-4",
                "faculty": "Dr. R. Ragul",
                "designation": "AP / Maths",
                "schedule": [
                    {"day": "Monday", "periods": [4]},
                    {"day": "Tuesday", "periods": [3]},
                    {"day": "Thursday", "periods": [4]},
                    {"day": "Friday", "periods": [2]}
                ]
            },
            {
                "code": "21CYB101J",
                "name": "Chemistry",
                "slot": "B",
                "credit": "3-1-2-5",
                "faculty": "Dr. P. Pachamuthu",
                "designation": "AP/Che",
                "schedule": [
                    {"day": "Monday", "periods": [3, 6, 7]},  # 3 is theory, 6,7 is Che lab
                    {"day": "Tuesday", "periods": [2]},
                    {"day": "Wednesday", "periods": [1]},
                    {"day": "Friday", "periods": [4]}
                ]
            },
            {
                "code": "21BTB102J",
                "name": "Electronic System and PCB Design",
                "slot": "C",
                "credit": "2-0-0-2",
                "faculty": "Dr. U. Shajith Ali",
                "designation": "Asso.Prof/EEE",
                "schedule": [
                    {"day": "Tuesday", "periods": [1]},
                    {"day": "Wednesday", "periods": [8, 9]},  # PCB Lab
                    {"day": "Friday", "periods": [3]}
                ]
            },
            {
                "code": "21CSS101J",
                "name": "Programming for Problem Solving",
                "slot": "D",
                "credit": "3-0-2-4",
                "faculty": "Dr. A. Rama Prasath",
                "designation": "Asso.Prof/CA",
                "schedule": [
                    {"day": "Tuesday", "periods": [4]},
                    {"day": "Wednesday", "periods": [3, 6, 7]},  # 3 theory, 6,7 PPS LAB
                    {"day": "Friday", "periods": [1]}
                ]
            },
            {
                "code": "21GNH101J",
                "name": "Philosophy of Engineering",
                "slot": "E",
                "credit": "1-0-2-2",
                "faculty": "Dr. R. Aarthi",
                "designation": "AP/Phy",
                "schedule": [
                    {"day": "Monday", "periods": [1, 2]},
                    {"day": "Wednesday", "periods": [2]}
                ]
            },
            {
                "code": "21BTB103T",
                "name": "Biology",
                "slot": "F",
                "credit": "2-0-0-2",
                "faculty": "Dr. M. Jaya Priya",
                "designation": "AP/Biotech.",
                "schedule": [
                    {"day": "Monday", "periods": [8]},
                    {"day": "Friday", "periods": [6]}
                ]
            },
            {
                "code": "21LEH104T",
                "name": "German",
                "slot": "GER",
                "credit": "2-1-0-3",
                "faculty": "Mr. Selva",
                "designation": "German",
                "schedule": [
                    {"day": "Thursday", "periods": [2, 3]},
                    {"day": "Friday", "periods": [8, 9]}
                ]
            },
            {
                "code": "21MES101L",
                "name": "Basic Civil and Mechanical Workshop",
                "slot": "WS",
                "credit": "0-0-4-2",
                "faculty": "Dr. N.S. Balaji / Dr. M. Kumaran",
                "designation": "Asst.Prof/Mech",
                "schedule": [
                    {"day": "Tuesday", "periods": [6, 7]}
                ]
            },
            {
                "code": "21PDM102L",
                "name": "General Aptitude",
                "slot": "CDC",
                "credit": "0-0-2-0",
                "faculty": "Mr. Sivanandhan",
                "designation": "Communication Trainer",
                "schedule": [
                    {"day": "Monday", "periods": [9]},
                    {"day": "Thursday", "periods": [6, 7]}
                ]
            },
            {
                "code": "21GNM102L",
                "name": "NSS",
                "slot": "NSS",
                "credit": "0-0-2-0",
                "faculty": "Dr. R. Manickam",
                "designation": "Physical Director",
                "schedule": [
                    {"day": "Thursday", "periods": [8, 9]}
                ]
            }
        ]
    }
]

data = {
    "metadata": {
        "institution": "SRM Institute of Science and Technology - Tiruchirappalli",
        "faculty": "Faculty of Engineering and Technology",
        "school": "School of Electrical and Electronics Engineering",
        "semesterStart": SEMESTER_START,
        "semesterEnd": SEMESTER_END,
        "sectionsCount": len(sections)
    },
    "sections": sections
}

with open("backend/data/timetables.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Successfully generated backend/data/timetables.json with {len(sections)} sections.")
