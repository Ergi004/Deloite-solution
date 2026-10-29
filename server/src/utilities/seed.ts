import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';
import { dataSource } from '../modules/data-source';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Skill } from '../skills/entities/skill.entity';
import { UserSkill } from '../skills/entities/user-skill.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseSkill } from '../courses/entities/course-skill.entity';
import { Job } from '../jobs/entities/job.entity';
import { JobSkill } from '../jobs/entities/job-skill.entity';
import { JobProgression } from '../jobs/entities/job-progression.entity';
import { OnboardingResponse } from '../onboarding/entities/onboarding-response.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import {
  CareerPathStatus,
  GenerationMethod,
  TrackPreference,
  UserRole,
  UserStatus,
} from '../types/enums';
import { generateRawToken, hashToken } from '../helpers/token.helper';
import { SKILLS } from '../database/seed-data/skills';
import { COURSES } from '../database/seed-data/courses';
import { JOBS, LADDER_JOBS, PROGRESSIONS } from '../database/seed-data/jobs';
import { normalizeStudentContext } from '../career-path/ai/pipeline/normalize';
import { filterCandidates } from '../career-path/ai/pipeline/filter';
import { computeFitAndGaps } from '../career-path/ai/pipeline/gap';
import { buildFallbackCareerPath } from '../career-path/ai/pipeline/fallback';

const COMPANY_SLUG = 'northwind-technologies';
const ADMIN_EMAIL = 'hr@northwind-demo.com';
const ADMIN_PASSWORD = 'Demo-HR-2026!';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Refusing to run the demo seed in production (NODE_ENV=production).',
    );
    process.exit(1);
  }

  await dataSource.initialize();
  console.log('Connected to database.');

  const companyRepo = dataSource.getRepository(Company);
  const userRepo = dataSource.getRepository(User);
  const profileRepo = dataSource.getRepository(StudentProfile);
  const invitationRepo = dataSource.getRepository(Invitation);
  const skillRepo = dataSource.getRepository(Skill);
  const userSkillRepo = dataSource.getRepository(UserSkill);
  const courseRepo = dataSource.getRepository(Course);
  const courseSkillRepo = dataSource.getRepository(CourseSkill);
  const jobRepo = dataSource.getRepository(Job);
  const jobSkillRepo = dataSource.getRepository(JobSkill);
  const progressionRepo = dataSource.getRepository(JobProgression);
  const onboardingRepo = dataSource.getRepository(OnboardingResponse);
  const careerPathRepo = dataSource.getRepository(CareerPath);

  // --- Company ---
  let company = await companyRepo.findOne({ where: { slug: COMPANY_SLUG } });
  if (!company) {
    company = await companyRepo.save(
      companyRepo.create({
        name: 'Northwind Technologies',
        slug: COMPANY_SLUG,
        logoUrl: null,
        industries: [
          'Software and IT Services',
          'Data and Analytics',
          'Digital Marketing',
          'Finance and Accounting',
          'Human Resources',
          'Sales and Customer Success',
          'Operations',
        ],
        defaultInviteExpiryDays: 14,
      }),
    );
    console.log(`Created company "${company.name}".`);
  } else {
    console.log(`Company "${company.name}" already exists, reusing it.`);
  }

  // --- Admin user ---
  let admin = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        companyId: company.id,
        email: ADMIN_EMAIL,
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: UserRole.COMPANY_ADMIN,
        status: UserStatus.ACTIVE,
      }),
    );
    console.log(
      `Created demo company admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
    );
  } else {
    console.log('Demo company admin already exists.');
  }

  // --- Skills ---
  const skillByName = new Map<string, Skill>();
  for (const s of SKILLS) {
    let skill = await skillRepo.findOne({ where: { name: s.name } });
    if (!skill) {
      skill = await skillRepo.save(
        skillRepo.create({
          name: s.name,
          category: s.category,
          roleFamilies: s.roleFamilies,
          description: s.description,
        }),
      );
    }
    skillByName.set(s.name, skill);
  }
  console.log(`Seeded ${skillByName.size} skills.`);

  // --- Courses ---
  let coursesCreated = 0;
  for (const c of COURSES) {
    const existing = await courseRepo.findOne({
      where: { title: c.title, provider: c.provider },
    });
    if (existing) continue;
    const course = await courseRepo.save(
      courseRepo.create({
        companyId: null,
        title: c.title,
        provider: c.provider,
        url: c.url,
        format: c.format,
        level: c.level,
        estimatedHours: c.estimatedHours,
        language: c.language,
        cost: c.cost,
        isInternal: c.isInternal,
      }),
    );
    for (const sk of c.skills) {
      const skill = skillByName.get(sk.skillName);
      if (!skill) {
        console.warn(
          `Course "${c.title}" references unknown skill "${sk.skillName}"`,
        );
        continue;
      }
      await courseSkillRepo.save(
        courseSkillRepo.create({
          courseId: course.id,
          skillId: skill.id,
          levelGained: sk.levelGained,
        }),
      );
    }
    coursesCreated++;
  }
  console.log(
    `Seeded ${coursesCreated} new courses (${COURSES.length} defined total).`,
  );

  // --- Jobs ---
  const allSeedJobs = [...JOBS, ...LADDER_JOBS];
  const jobByCode = new Map<string, Job>();
  let jobsCreated = 0;
  for (const j of allSeedJobs) {
    let job = await jobRepo.findOne({
      where: { companyId: company.id, code: j.code },
    });
    if (!job) {
      job = await jobRepo.save(
        jobRepo.create({
          companyId: company.id,
          code: j.code,
          title: j.title,
          department: j.department,
          roleFamily: j.roleFamily,
          industry: j.industry,
          seniority: j.seniority,
          employmentType: j.employmentType,
          location: j.location,
          workMode: j.workMode,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          salaryCurrency: j.salaryCurrency,
          openings: j.openings,
          status: j.status,
          targetStartDate: j.targetStartDate,
          closingDate: j.closingDate,
          summary: j.summary,
          responsibilities: j.responsibilities,
          niceToHaveSkills: j.niceToHaveSkills,
          toolsAndTech: j.toolsAndTech,
          educationRequirement: j.educationRequirement,
          minYearsExperience: String(j.minYearsExperience),
          languages: j.languages,
          softSkillRequirements: j.softSkillRequirements,
          monthsToProductivity: j.monthsToProductivity,
          promotionCriteria: j.promotionCriteria,
          reportsTo: j.reportsTo,
          teamSize: j.teamSize,
        }),
      );
      for (const rs of j.requiredSkills) {
        const skill = skillByName.get(rs.skillName);
        if (!skill) {
          console.warn(
            `Job "${j.title}" references unknown skill "${rs.skillName}"`,
          );
          continue;
        }
        await jobSkillRepo.save(
          jobSkillRepo.create({
            jobId: job.id,
            skillId: skill.id,
            minLevel: rs.minLevel,
            weight: rs.weight,
            isRequired: rs.isRequired,
          }),
        );
      }
      jobsCreated++;
    }
    jobByCode.set(j.code, job);
  }
  console.log(
    `Seeded ${jobsCreated} new jobs (${allSeedJobs.length} defined total).`,
  );

  // --- Progressions ---
  let progressionsCreated = 0;
  for (const p of PROGRESSIONS) {
    const fromJob = jobByCode.get(p.fromCode);
    const toJob = jobByCode.get(p.toCode);
    if (!fromJob || !toJob) continue;
    const existing = await progressionRepo.findOne({
      where: { fromJobId: fromJob.id, toJobId: toJob.id },
    });
    if (existing) continue;
    await progressionRepo.save(
      progressionRepo.create({
        fromJobId: fromJob.id,
        toJobId: toJob.id,
        typicalMonths: p.typicalMonths,
        notes: p.notes ?? null,
      }),
    );
    progressionsCreated++;
  }
  console.log(`Seeded ${progressionsCreated} new job progressions.`);

  // --- Invitations: 3 pending, 1 used, 1 expired ---
  const existingInvitationCount = await invitationRepo.count({
    where: { companyId: company.id },
  });
  if (existingInvitationCount === 0) {
    const pendingUrls: string[] = [];
    for (let i = 0; i < 3; i++) {
      const raw = generateRawToken();
      await invitationRepo.save(
        invitationRepo.create({
          companyId: company.id,
          email: null,
          tokenHash: hashToken(raw),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdById: admin.id,
          note: 'Seeded pending invitation',
        }),
      );
      pendingUrls.push(buildInviteUrl(raw));
    }

    const expiredRaw = generateRawToken();
    await invitationRepo.save(
      invitationRepo.create({
        companyId: company.id,
        email: null,
        tokenHash: hashToken(expiredRaw),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdById: admin.id,
        note: 'Seeded expired invitation (for UI testing)',
      }),
    );

    console.log(
      'Seeded 3 pending invitations and 1 expired invitation. Pending invite links:',
    );
    pendingUrls.forEach((url) => console.log(`  ${url}`));
    console.log(`  (expired, for UI testing): ${buildInviteUrl(expiredRaw)}`);
  } else {
    console.log('Invitations already seeded, skipping.');
  }

  // --- Demo students with completed onboarding and fallback career paths ---
  await seedDemoStudent({
    email: 'ana.demo@northwind-demo.com',
    firstName: 'Ana',
    lastName: 'Kovaci',
    company,
    preferredIndustry: 'Software and IT Services',
    roleFamily: 'Engineering',
    targetRole: 'Backend Developer',
    skillLevels: [
      ['JavaScript', 3],
      ['TypeScript', 2],
      ['Node.js', 2],
      ['SQL', 2],
      ['Git', 3],
      ['Communication', 4],
      ['Teamwork', 4],
    ],
    deps: {
      userRepo,
      profileRepo,
      userSkillRepo,
      skillByName,
      onboardingRepo,
      careerPathRepo,
      jobRepo,
      jobSkillRepo,
      progressionRepo,
      courseRepo,
      courseSkillRepo,
      invitationRepo,
      admin,
    },
  });

  await seedDemoStudent({
    email: 'dren.demo@northwind-demo.com',
    firstName: 'Dren',
    lastName: 'Hasani',
    company,
    preferredIndustry: 'Data and Analytics',
    roleFamily: 'Data',
    targetRole: 'Data Analyst',
    skillLevels: [
      ['SQL', 3],
      ['Data analysis', 2],
      ['Excel advanced', 3],
      ['Statistics', 2],
      ['Communication', 3],
      ['Critical thinking', 4],
    ],
    deps: {
      userRepo,
      profileRepo,
      userSkillRepo,
      skillByName,
      onboardingRepo,
      careerPathRepo,
      jobRepo,
      jobSkillRepo,
      progressionRepo,
      courseRepo,
      courseSkillRepo,
      invitationRepo,
      admin,
    },
  });

  console.log('\nSeed complete.');
  console.log(`Demo HR login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  await dataSource.destroy();
}

function buildInviteUrl(rawToken: string): string {
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  return `${webOrigin}/register?token=${rawToken}`;
}

interface SeedStudentDeps {
  userRepo: ReturnType<typeof dataSource.getRepository<User>>;
  profileRepo: ReturnType<typeof dataSource.getRepository<StudentProfile>>;
  userSkillRepo: ReturnType<typeof dataSource.getRepository<UserSkill>>;
  skillByName: Map<string, Skill>;
  onboardingRepo: ReturnType<
    typeof dataSource.getRepository<OnboardingResponse>
  >;
  careerPathRepo: ReturnType<typeof dataSource.getRepository<CareerPath>>;
  jobRepo: ReturnType<typeof dataSource.getRepository<Job>>;
  jobSkillRepo: ReturnType<typeof dataSource.getRepository<JobSkill>>;
  progressionRepo: ReturnType<typeof dataSource.getRepository<JobProgression>>;
  courseRepo: ReturnType<typeof dataSource.getRepository<Course>>;
  courseSkillRepo: ReturnType<typeof dataSource.getRepository<CourseSkill>>;
  invitationRepo: ReturnType<typeof dataSource.getRepository<Invitation>>;
  admin: User;
}

async function seedDemoStudent(opts: {
  email: string;
  firstName: string;
  lastName: string;
  company: Company;
  preferredIndustry: string;
  roleFamily: string;
  targetRole: string;
  skillLevels: [string, number][];
  deps: SeedStudentDeps;
}) {
  const { deps } = opts;
  const existing = await deps.userRepo.findOne({
    where: { email: opts.email },
  });
  if (existing) {
    console.log(`Demo student ${opts.email} already exists, skipping.`);
    return;
  }

  const user = await deps.userRepo.save(
    deps.userRepo.create({
      companyId: opts.company.id,
      email: opts.email,
      passwordHash: await bcrypt.hash('Demo-Student-2026!', 12),
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
    }),
  );

  // One used invitation, bound to this demo student, for UI testing.
  const usedRaw = generateRawToken();
  await deps.invitationRepo.save(
    deps.invitationRepo.create({
      companyId: opts.company.id,
      email: opts.email,
      tokenHash: hashToken(usedRaw),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      usedAt: new Date(),
      usedByUserId: user.id,
      createdById: deps.admin.id,
      note: 'Seeded used invitation (for UI testing)',
    }),
  );

  const now = new Date();
  const profile = await deps.profileRepo.save(
    deps.profileRepo.create({
      userId: user.id,
      firstName: opts.firstName,
      lastName: opts.lastName,
      university: 'University of Tirana',
      degreeLevel: 'Bachelor',
      fieldOfStudy: 'Computer Science',
      graduationYear: 2025,
      notableProjects:
        'Built a small web app for a university club during the final year project.',
      languages: [{ language: 'English', level: 'B2' }],
      preferredIndustry: opts.preferredIndustry,
      interests: ['Building things', 'Solving puzzles'],
      dayToDayPreferences: ['Building things', 'Solving puzzles'],
      softSkillsSelf: {
        communication: 4,
        teamwork: 4,
        leadership: 3,
        problemSolving: 4,
        timeManagement: 3,
        adaptability: 4,
        creativity: 3,
      },
      softSkillsSituational: { conflict: 4, deadline: 4, feedback: 5 },
      roleFamily: opts.roleFamily,
      targetRole: opts.targetRole,
      trackPreference: TrackPreference.INDIVIDUAL_CONTRIBUTOR,
      targetHorizonYears: 2,
      targetLevel: 'Mid',
      goalStatement: `In two years I want to become a confident ${opts.targetRole} who can own features end to end.`,
      weeklyLearningHours: 6,
      expectations: ['mentorship', 'salary growth'],
      consentPrivacyAt: now,
      consentAiAt: now,
      onboardingStep: 7,
      onboardingCompletedAt: now,
    }),
  );

  for (const [skillName, level] of opts.skillLevels) {
    const skill = deps.skillByName.get(skillName);
    if (!skill) continue;
    await deps.userSkillRepo.save(
      deps.userSkillRepo.create({ userId: user.id, skillId: skill.id, level }),
    );
  }

  await deps.onboardingRepo.save([
    deps.onboardingRepo.create({
      userId: user.id,
      step: 1,
      data: {
        fieldOfStudy: profile.fieldOfStudy,
        degreeLevel: profile.degreeLevel,
        university: profile.university,
        graduationYear: profile.graduationYear,
      },
    }),
    deps.onboardingRepo.create({
      userId: user.id,
      step: 2,
      data: {
        preferredIndustry: profile.preferredIndustry,
        interests: profile.interests,
        dayToDayPreferences: profile.dayToDayPreferences,
      },
    }),
    deps.onboardingRepo.create({
      userId: user.id,
      step: 3,
      data: {
        skills: opts.skillLevels.map(([skillId, level]) => ({
          skillId,
          level,
        })),
      },
    }),
    deps.onboardingRepo.create({
      userId: user.id,
      step: 4,
      data: profile.softSkillsSelf as Record<string, unknown>,
    }),
    deps.onboardingRepo.create({
      userId: user.id,
      step: 5,
      data: {
        roleFamily: profile.roleFamily,
        targetRole: profile.targetRole,
        trackPreference: profile.trackPreference,
      },
    }),
    deps.onboardingRepo.create({
      userId: user.id,
      step: 6,
      data: {
        targetHorizonYears: profile.targetHorizonYears,
        targetLevel: profile.targetLevel,
        goalStatement: profile.goalStatement,
        weeklyLearningHours: profile.weeklyLearningHours,
      },
    }),
  ]);

  // Build a fallback career path directly, with no Gemini call.
  const userSkillsWithSkill = await deps.userSkillRepo.find({
    where: { userId: user.id },
    relations: { skill: true },
  });
  const studentContext = normalizeStudentContext(profile, userSkillsWithSkill);

  const jobs = await deps.jobRepo.find({
    where: { companyId: opts.company.id },
  });
  const jobIds = jobs.map((j) => j.id);
  const jobSkills = await deps.jobSkillRepo.find({
    where: { jobId: In(jobIds) },
    relations: { skill: true },
  });
  const progressions = await deps.progressionRepo.find({
    where: { fromJobId: In(jobIds) },
    relations: { toJob: true },
  });
  const courses = await deps.courseRepo.find();
  const courseSkills = await deps.courseSkillRepo.find();

  const filterResult = filterCandidates(studentContext, {
    jobs,
    jobSkills,
    progressions,
    courses,
    courseSkills,
  });

  if (!filterResult) {
    console.log(
      `No candidate jobs for demo student ${opts.email}, skipping career path.`,
    );
    return;
  }

  const { candidateJobs } = computeFitAndGaps(studentContext, filterResult);
  const constraints = {
    horizonMonths: (profile.targetHorizonYears ?? 2) * 12,
    weeklyHours: profile.weeklyLearningHours ?? 5,
    maxTotalHours: Math.round(
      (profile.targetHorizonYears ?? 2) *
        12 *
        4.3 *
        (profile.weeklyLearningHours ?? 5) *
        0.8,
    ),
  };
  const output = buildFallbackCareerPath(
    studentContext,
    candidateJobs,
    filterResult,
    constraints,
  );

  await deps.careerPathRepo.save(
    deps.careerPathRepo.create({
      userId: user.id,
      version: 1,
      status: CareerPathStatus.READY,
      inputSnapshot: {
        student: studentContext,
        constraints,
      } as unknown as Record<string, unknown>,
      output: output as unknown as Record<string, unknown>,
      validationReport: { valid: true, seeded: true },
      generationMethod: GenerationMethod.FALLBACK,
      model: null,
      promptVersion: 'career-path.v1',
      tokensIn: null,
      tokensOut: null,
    }),
  );

  console.log(
    `Seeded demo student ${opts.email} with a completed onboarding and a career path.`,
  );
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
