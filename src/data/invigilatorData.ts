import type { InvigilatorProfile, AvailableClass, AvailableExam, Department, SchoolClass, MonitoringSession, SystemStats } from "@/types";
/**
 * LMSGuard AI — Invigilator Data
 *
 * Invigilators are NOT pre-assigned to a class.
 * They dynamically choose a class and exam after login each session.
 */

// ─── Invigilator Profiles ─────────────────────────────────────────────────────
export const INVIGILATORS : InvigilatorProfile[] = [
  { id:"INV001", name:"John Martin",   email:"john.martin@college.edu",   avatar:"JM", department:"Computer Science" },
  { id:"INV002", name:"Sarah Thomas",  email:"sarah.thomas@college.edu",  avatar:"ST", department:"Computer Science" },
  { id:"INV003", name:"Ravi Sharma",   email:"ravi.sharma@college.edu",   avatar:"RS", department:"Electronics"      },
  { id:"INV004", name:"Priya Nair",    email:"priya.nair@college.edu",    avatar:"PN", department:"Information Tech" },
];

/** Resolve invigilator profile by email — defaults to INV001 for demo */
export function getInvigilatorByEmail(email: string): InvigilatorProfile {
  return (
    INVIGILATORS.find(inv => inv.email.toLowerCase() === email.toLowerCase()) ??
    INVIGILATORS[0]
  );
}

// ─── Available Classes ────────────────────────────────────────────────────────
export const AVAILABLE_CLASSES : AvailableClass[] = [
  { id:"CSE-3A", label:"CSE – 3rd Year A", dept:"Computer Science",  year:"3rd Year", section:"A", strength:20 },
  { id:"CSE-3B", label:"CSE – 3rd Year B", dept:"Computer Science",  year:"3rd Year", section:"B", strength:8  },
  { id:"ECE-3A", label:"ECE – 3rd Year A", dept:"Electronics",       year:"3rd Year", section:"A", strength:10 },
  { id:"IT-2A",  label:"IT – 2nd Year A",  dept:"Information Tech",  year:"2nd Year", section:"A", strength:10 },
];

// ─── Available Exams ─────────────────────────────────────────────────────────
export const AVAILABLE_EXAMS : AvailableExam[] = [
  {
    id:"EX001", title:"DBMS Final Exam",         subject:"Database Management Systems",
    code:"CS501", date:"30-06-2026", startTime:"10:00 AM", endTime:"11:00 AM",
    duration:60, totalQuestions:50, totalMarks:100, passingMarks:40,
    eligibleClasses:["CSE-3A","CSE-3B"],
  },
  {
    id:"EX002", title:"Java Programming Test",   subject:"Object Oriented Programming",
    code:"CS401", date:"30-06-2026", startTime:"02:00 PM", endTime:"02:45 PM",
    duration:45, totalQuestions:30, totalMarks:60, passingMarks:24,
    eligibleClasses:["CSE-3A","CSE-3B"],
  },
  {
    id:"EX003", title:"Data Structures Test",    subject:"Data Structures & Algorithms",
    code:"CS301", date:"01-07-2026", startTime:"09:00 AM", endTime:"10:00 AM",
    duration:60, totalQuestions:40, totalMarks:80, passingMarks:32,
    eligibleClasses:["CSE-3A","CSE-3B","IT-2A"],
  },
  {
    id:"EX004", title:"Digital Circuits Exam",   subject:"Digital Electronics",
    code:"EC401", date:"30-06-2026", startTime:"11:00 AM", endTime:"12:00 PM",
    duration:60, totalQuestions:50, totalMarks:100, passingMarks:40,
    eligibleClasses:["ECE-3A"],
  },
  {
    id:"EX005", title:"Web Technologies Test",   subject:"Web Development",
    code:"IT301", date:"01-07-2026", startTime:"02:00 PM", endTime:"02:45 PM",
    duration:45, totalQuestions:30, totalMarks:60, passingMarks:24,
    eligibleClasses:["IT-2A","CSE-3B"],
  },
];

/** Returns exams available for a given class */
export function getExamsForClass(classId: string): AvailableExam[] {
  return AVAILABLE_EXAMS.filter(e => e.eligibleClasses.includes(classId));
}

// ─── Class → Students ─────────────────────────────────────────────────────────
export const CLASS_STUDENTS = {
  "CSE-3A": [
    { id:"S101", name:"Rahul Kumar",    regno:"22CS101", avatar:"RK", risk:10,  status:"safe",      violations:[] },
    { id:"S102", name:"Arjun Mehta",    regno:"22CS102", avatar:"AM", risk:88,  status:"violation",
      violations:[
        { time:"10:30", type:"Browser Switch",     detail:"Chrome tab changed",   severity:"medium"   },
        { time:"10:40", type:"Application Switch", detail:"VS Code opened",        severity:"critical" },
      ]},
    { id:"S103", name:"Priya Sharma",   regno:"22CS103", avatar:"PS", risk:35,  status:"warning",
      violations:[{ time:"10:45", type:"Browser Switch", detail:"New tab opened", severity:"medium" }]},
    { id:"S104", name:"Karthik Rajan",  regno:"22CS104", avatar:"KR", risk:62,  status:"warning",
      violations:[{ time:"10:42", type:"Multiple Faces", detail:"2nd person detected", severity:"critical" }]},
    { id:"S105", name:"Deepa Nair",     regno:"22CS105", avatar:"DN", risk:5,   status:"safe",      violations:[] },
    { id:"S106", name:"Vikram Singh",   regno:"22CS106", avatar:"VS", risk:91,  status:"violation",
      violations:[
        { time:"10:35", type:"Unknown App",     detail:"Terminal opened",     severity:"critical" },
        { time:"10:50", type:"Idle Detected",   detail:"No activity 5 mins",  severity:"warning"  },
      ]},
    { id:"S107", name:"Anjali Gupta",   regno:"22CS107", avatar:"AG", risk:22,  status:"safe",      violations:[] },
    { id:"S108", name:"Rohit Verma",    regno:"22CS108", avatar:"RV", risk:48,  status:"warning",
      violations:[{ time:"10:47", type:"Copy/Paste", detail:"Clipboard activity", severity:"medium" }]},
    { id:"S109", name:"Sneha Reddy",    regno:"22CS109", avatar:"SR", risk:15,  status:"safe",      violations:[] },
    { id:"S110", name:"Aditya Roy",     regno:"22CS110", avatar:"AR", risk:74,  status:"violation",
      violations:[{ time:"10:40", type:"Screen Capture", detail:"Screenshot attempt", severity:"critical" }]},
    { id:"S111", name:"Meera Iyer",     regno:"22CS111", avatar:"MI", risk:28,  status:"safe",      violations:[] },
    { id:"S112", name:"Nikhil Joshi",   regno:"22CS112", avatar:"NJ", risk:55,  status:"warning",
      violations:[{ time:"10:50", type:"Idle Detected", detail:"Mouse inactive 3 min", severity:"warning" }]},
    { id:"S113", name:"Kavya Menon",    regno:"22CS113", avatar:"KM", risk:8,   status:"safe",      violations:[] },
    { id:"S114", name:"Suresh Babu",    regno:"22CS114", avatar:"SB", risk:40,  status:"warning",
      violations:[{ time:"10:55", type:"Browser Switch", detail:"New window opened", severity:"medium" }]},
    { id:"S115", name:"Lakshmi Devi",   regno:"22CS115", avatar:"LD", risk:12,  status:"safe",      violations:[] },
    { id:"S116", name:"Harish Kumar",   regno:"22CS116", avatar:"HK", risk:80,  status:"violation",
      violations:[{ time:"10:22", type:"App Switch", detail:"Discord opened", severity:"critical" }]},
    { id:"S117", name:"Divya Krishnan", regno:"22CS117", avatar:"DK", risk:18,  status:"safe",      violations:[] },
    { id:"S118", name:"Ravi Shankar",   regno:"22CS118", avatar:"RS", risk:33,  status:"safe",      violations:[] },
    { id:"S119", name:"Pooja Patel",    regno:"22CS119", avatar:"PP", risk:65,  status:"warning",
      violations:[{ time:"10:48", type:"Multiple Faces", detail:"Person in background", severity:"warning" }]},
    { id:"S120", name:"Siddharth Das",  regno:"22CS120", avatar:"SD", risk:45,  status:"warning",
      violations:[{ time:"10:52", type:"Copy/Paste", detail:"Clipboard activity", severity:"medium" }]},
  ],
  "CSE-3B": [
    { id:"S201", name:"Ananya Sharma",  regno:"22CS201", avatar:"AS", risk:20,  status:"safe",      violations:[] },
    { id:"S202", name:"Rahul Verma",    regno:"22CS202", avatar:"RV", risk:75,  status:"violation",
      violations:[{ time:"14:12", type:"Browser Switch", detail:"Chrome tab changed", severity:"medium" }]},
    { id:"S203", name:"Priyanka Das",   regno:"22CS203", avatar:"PD", risk:30,  status:"safe",      violations:[] },
    { id:"S204", name:"Arun Kumar",     regno:"22CS204", avatar:"AK", risk:55,  status:"warning",
      violations:[{ time:"14:20", type:"Idle Detected", detail:"No activity 3 min", severity:"warning" }]},
    { id:"S205", name:"Nisha Gupta",    regno:"22CS205", avatar:"NG", risk:10,  status:"safe",      violations:[] },
    { id:"S206", name:"Kiran Reddy",    regno:"22CS206", avatar:"KR", risk:85,  status:"violation",
      violations:[{ time:"14:15", type:"App Switch", detail:"VS Code opened", severity:"critical" }]},
    { id:"S207", name:"Mohan Singh",    regno:"22CS207", avatar:"MS", risk:25,  status:"safe",      violations:[] },
    { id:"S208", name:"Sunita Rao",     regno:"22CS208", avatar:"SR", risk:42,  status:"warning",
      violations:[{ time:"14:30", type:"Copy/Paste", detail:"Clipboard activity", severity:"medium" }]},
  ],
  "ECE-3A": [
    { id:"S301", name:"Nandini Pillai", regno:"22EC301", avatar:"NP", risk:12,  status:"safe",      violations:[] },
    { id:"S302", name:"Sunil Babu",     regno:"22EC302", avatar:"SB", risk:70,  status:"violation",
      violations:[{ time:"11:10", type:"Browser Switch", detail:"YouTube opened", severity:"critical" }]},
    { id:"S303", name:"Rekha Menon",    regno:"22EC303", avatar:"RM", risk:25,  status:"safe",      violations:[] },
    { id:"S304", name:"Ajay Nair",      regno:"22EC304", avatar:"AN", risk:50,  status:"warning",
      violations:[{ time:"11:20", type:"Idle Detected", detail:"No activity 4 min", severity:"warning" }]},
    { id:"S305", name:"Dhanya Raj",     regno:"22EC305", avatar:"DR", risk:8,   status:"safe",      violations:[] },
    { id:"S306", name:"Pramod Kumar",   regno:"22EC306", avatar:"PK", risk:88,  status:"violation",
      violations:[{ time:"11:15", type:"App Switch", detail:"VS Code opened", severity:"critical" }]},
    { id:"S307", name:"Lekshmi G",      regno:"22EC307", avatar:"LG", risk:30,  status:"safe",      violations:[] },
    { id:"S308", name:"Vishnu Dev",     regno:"22EC308", avatar:"VD", risk:45,  status:"warning",
      violations:[{ time:"11:30", type:"Copy/Paste", detail:"Clipboard activity", severity:"medium" }]},
    { id:"S309", name:"Athira S",       regno:"22EC309", avatar:"AS", risk:15,  status:"safe",      violations:[] },
    { id:"S310", name:"Bibin Thomas",   regno:"22EC310", avatar:"BT", risk:60,  status:"warning",
      violations:[{ time:"11:35", type:"Multiple Faces", detail:"Person detected", severity:"critical" }]},
  ],
  "IT-2A": [
    { id:"S401", name:"Amrita Singh",   regno:"22IT401", avatar:"AS", risk:18,  status:"safe",      violations:[] },
    { id:"S402", name:"Rohan Kapoor",   regno:"22IT402", avatar:"RK", risk:65,  status:"warning",
      violations:[{ time:"14:05", type:"Browser Switch", detail:"New tab opened", severity:"medium" }]},
    { id:"S403", name:"Tanvi Shah",     regno:"22IT403", avatar:"TS", risk:10,  status:"safe",      violations:[] },
    { id:"S404", name:"Karan Mehta",    regno:"22IT404", avatar:"KM", risk:82,  status:"violation",
      violations:[{ time:"14:10", type:"App Switch", detail:"VS Code opened", severity:"critical" }]},
    { id:"S405", name:"Simran Kaur",    regno:"22IT405", avatar:"SK", risk:22,  status:"safe",      violations:[] },
    { id:"S406", name:"Aryan Gupta",    regno:"22IT406", avatar:"AG", risk:48,  status:"warning",
      violations:[{ time:"14:15", type:"Idle Detected", detail:"No activity 4 min", severity:"warning" }]},
    { id:"S407", name:"Naina Joshi",    regno:"22IT407", avatar:"NJ", risk:5,   status:"safe",      violations:[] },
    { id:"S408", name:"Saurav Das",     regno:"22IT408", avatar:"SD", risk:72,  status:"violation",
      violations:[{ time:"14:20", type:"Screen Capture", detail:"Screenshot attempt", severity:"critical" }]},
    { id:"S409", name:"Ishita Roy",     regno:"22IT409", avatar:"IR", risk:35,  status:"warning",
      violations:[{ time:"14:22", type:"Copy/Paste", detail:"Clipboard activity", severity:"medium" }]},
    { id:"S410", name:"Manav Sethi",    regno:"22IT410", avatar:"MS", risk:14,  status:"safe",      violations:[] },
  ],
};

// ─── Class → Violations ───────────────────────────────────────────────────────
export const CLASS_VIOLATIONS = {
  "CSE-3A": [
    { id:"V001", studentId:"S102", studentName:"Arjun Mehta",   regno:"22CS102", type:"Application Switch", detail:"VS Code Opened",       severity:"critical", time:"10:40", timestamp:Date.now()-420000 },
    { id:"V002", studentId:"S101", studentName:"Rahul Kumar",   regno:"22CS101", type:"Browser Switch",     detail:"Chrome tab changed",   severity:"medium",   time:"10:30", timestamp:Date.now()-600000 },
    { id:"V003", studentId:"S106", studentName:"Vikram Singh",  regno:"22CS106", type:"Unknown App",        detail:"Terminal opened",       severity:"critical", time:"10:35", timestamp:Date.now()-540000 },
    { id:"V004", studentId:"S104", studentName:"Karthik Rajan", regno:"22CS104", type:"Multiple Faces",     detail:"2nd person detected",  severity:"critical", time:"10:42", timestamp:Date.now()-360000 },
    { id:"V005", studentId:"S103", studentName:"Priya Sharma",  regno:"22CS103", type:"Browser Switch",     detail:"New tab opened",       severity:"medium",   time:"10:45", timestamp:Date.now()-300000 },
    { id:"V006", studentId:"S108", studentName:"Rohit Verma",   regno:"22CS108", type:"Copy/Paste",         detail:"Clipboard activity",   severity:"medium",   time:"10:47", timestamp:Date.now()-180000 },
    { id:"V007", studentId:"S110", studentName:"Aditya Roy",    regno:"22CS110", type:"Screen Capture",     detail:"Screenshot attempt",   severity:"critical", time:"10:40", timestamp:Date.now()-360000 },
    { id:"V008", studentId:"S116", studentName:"Harish Kumar",  regno:"22CS116", type:"App Switch",         detail:"Discord opened",       severity:"critical", time:"10:22", timestamp:Date.now()-720000 },
  ],
  "CSE-3B": [
    { id:"V201", studentId:"S202", studentName:"Rahul Verma",   regno:"22CS202", type:"Browser Switch",     detail:"Chrome tab changed",   severity:"medium",   time:"14:12", timestamp:Date.now()-480000 },
    { id:"V202", studentId:"S206", studentName:"Kiran Reddy",   regno:"22CS206", type:"App Switch",         detail:"VS Code opened",       severity:"critical", time:"14:15", timestamp:Date.now()-420000 },
    { id:"V203", studentId:"S204", studentName:"Arun Kumar",    regno:"22CS204", type:"Idle Detected",      detail:"No activity 3 min",    severity:"warning",  time:"14:20", timestamp:Date.now()-360000 },
    { id:"V204", studentId:"S208", studentName:"Sunita Rao",    regno:"22CS208", type:"Copy/Paste",         detail:"Clipboard activity",   severity:"medium",   time:"14:30", timestamp:Date.now()-180000 },
  ],
  "ECE-3A": [
    { id:"V301", studentId:"S302", studentName:"Sunil Babu",    regno:"22EC302", type:"Browser Switch",     detail:"YouTube opened",       severity:"critical", time:"11:10", timestamp:Date.now()-600000 },
    { id:"V302", studentId:"S306", studentName:"Pramod Kumar",  regno:"22EC306", type:"App Switch",         detail:"VS Code opened",       severity:"critical", time:"11:15", timestamp:Date.now()-540000 },
    { id:"V303", studentId:"S304", studentName:"Ajay Nair",     regno:"22EC304", type:"Idle Detected",      detail:"No activity 4 min",    severity:"warning",  time:"11:20", timestamp:Date.now()-420000 },
    { id:"V304", studentId:"S310", studentName:"Bibin Thomas",  regno:"22EC310", type:"Multiple Faces",     detail:"Person detected",      severity:"critical", time:"11:35", timestamp:Date.now()-240000 },
  ],
  "IT-2A": [
    { id:"V401", studentId:"S404", studentName:"Karan Mehta",   regno:"22IT404", type:"App Switch",         detail:"VS Code opened",       severity:"critical", time:"14:10", timestamp:Date.now()-540000 },
    { id:"V402", studentId:"S402", studentName:"Rohan Kapoor",  regno:"22IT402", type:"Browser Switch",     detail:"New tab opened",       severity:"medium",   time:"14:05", timestamp:Date.now()-600000 },
    { id:"V403", studentId:"S406", studentName:"Aryan Gupta",   regno:"22IT406", type:"Idle Detected",      detail:"No activity 4 min",    severity:"warning",  time:"14:15", timestamp:Date.now()-480000 },
    { id:"V404", studentId:"S408", studentName:"Saurav Das",    regno:"22IT408", type:"Screen Capture",     detail:"Screenshot attempt",   severity:"critical", time:"14:20", timestamp:Date.now()-360000 },
  ],
};

// ─── Live event pool (for mock websocket) ─────────────────────────────────────
export const LIVE_EVENT_POOL = [
  { type:"Browser Switch",      detail:"Chrome tab changed",       severity:"medium"   },
  { type:"Application Switch",  detail:"VS Code opened",           severity:"critical" },
  { type:"Idle Detected",       detail:"No activity for 5 mins",   severity:"warning"  },
  { type:"Multiple Faces",      detail:"Secondary person detected",severity:"critical" },
  { type:"Copy/Paste",          detail:"Clipboard activity",       severity:"medium"   },
  { type:"Unknown App",         detail:"Terminal opened",          severity:"critical" },
  { type:"Screen Capture",      detail:"Screenshot attempt",       severity:"critical" },
  { type:"Audio Detected",      detail:"Microphone activity",      severity:"warning"  },
];
