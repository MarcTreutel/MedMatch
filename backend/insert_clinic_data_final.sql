-- Insert realistic clinic data into MedMatch database
-- Final version matching exact table structures

-- First, create clinic users

-- Insert clinic users first

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    '5ab6e9ab-3dff-4dbc-9165-399950ae4284',
    'clinic_5ab6e9ab',
    'internships@citygeneralhospital.com',
    'City General Hospital',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    '20ad18a3-6637-4c63-a349-5b7ac04fb691',
    'clinic_20ad18a3',
    'internships@st.marysmedicalcenter.com',
    'St. Mary''s Medical Center',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    'ee6550fb-6449-431f-b7a2-762dfc0fb25f',
    'clinic_ee6550fb',
    'internships@universitymedicalcenter.com',
    'University Medical Center',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    'b24df0e5-bc15-4730-8fff-0a7b7945ef67',
    'clinic_b24df0e5',
    'internships@regionalheartinstitute.com',
    'Regional Heart Institute',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    '366d3d21-1f8d-4640-9188-7f1e234c3701',
    'clinic_366d3d21',
    'internships@childrenshospitalnetwork.com',
    'Children''s Hospital Network',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    'e75f230c-2370-4c81-8d30-f15641396b58',
    'clinic_e75f230c',
    'internships@riversideorthopediccenter.com',
    'Riverside Orthopedic Center',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    'be326f5a-f987-467e-a0a2-80a5c0210e71',
    'clinic_be326f5a',
    'internships@mentalhealthassociates.com',
    'Mental Health Associates',
    'clinic',
    NOW(),
    NOW()
);

INSERT INTO users (id, auth0_id, email, name, role, created_at, updated_at)
VALUES (
    '84cabce7-8058-4f11-9c43-19b69f4cf6df',
    'clinic_84cabce7',
    'internships@womenshealthclinic.com',
    'Women''s Health Clinic',
    'clinic',
    NOW(),
    NOW()
);

-- Insert clinic profiles (only columns that exist)

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '46a31414-7497-42a7-8c4c-6ec88530afd8',
    '5ab6e9ab-3dff-4dbc-9165-399950ae4284',
    'City General Hospital',
    'Downtown Medical District'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '81a205e4-2ff6-4fca-a9e2-86a40027c533',
    '20ad18a3-6637-4c63-a349-5b7ac04fb691',
    'St. Mary''s Medical Center',
    'Westside Health Campus'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '5fdbb1ab-eca9-44a0-85a6-5b37f5c57ee6',
    'ee6550fb-6449-431f-b7a2-762dfc0fb25f',
    'University Medical Center',
    'Academic Health District'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '614762c5-d51e-433f-9d0b-c91d9e99e2b3',
    'b24df0e5-bc15-4730-8fff-0a7b7945ef67',
    'Regional Heart Institute',
    'Cardiac Care Plaza'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    'd66e6fd3-4ea6-4c6c-8cb7-49adf4003682',
    '366d3d21-1f8d-4640-9188-7f1e234c3701',
    'Children''s Hospital Network',
    'Pediatric Medical Campus'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '7d7a79ec-6c63-406a-82f6-7ca29dda08f2',
    'e75f230c-2370-4c81-8d30-f15641396b58',
    'Riverside Orthopedic Center',
    'Sports Medicine District'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '78c1133f-0da4-4634-8417-3b309d588d35',
    'be326f5a-f987-467e-a0a2-80a5c0210e71',
    'Mental Health Associates',
    'Behavioral Health Campus'
);

INSERT INTO clinic_profiles (id, user_id, clinic_name, address)
VALUES (
    '1601b70a-111f-47d1-adf1-e867fb19b38a',
    '84cabce7-8058-4f11-9c43-19b69f4cf6df',
    'Women''s Health Clinic',
    'Women''s Care Center'
);

-- Insert internship positions

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '625d1013-d9fd-475e-93a6-33859dd5e461',
    '46a31414-7497-42a7-8c4c-6ec88530afd8',
    'Cardiology Laboratory Internship',
    'Gain hands-on experience in cardiology at City General Hospital. Leading tertiary care hospital with comprehensive medical services',
    'Cardiology',
    3,
    '2025-10-22',
    '2025-09-22',
    'Previous healthcare experience preferred; Background check required; Available for weekend shifts',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'a943698c-62be-4f0e-a789-49e8fc617245',
    '46a31414-7497-42a7-8c4c-6ec88530afd8',
    'Surgery Administrative Fellowship',
    'Gain hands-on experience in surgery at City General Hospital. Leading tertiary care hospital with comprehensive medical services',
    'Surgery',
    3,
    '2026-02-12',
    '2026-01-13',
    'CPR certification required; Background check required; Completed basic clinical rotations',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '4e05dd50-a82d-4527-a593-fae127a8bdf4',
    '46a31414-7497-42a7-8c4c-6ec88530afd8',
    'Surgery Laboratory Internship',
    'Gain hands-on experience in surgery at City General Hospital. Leading tertiary care hospital with comprehensive medical services',
    'Surgery',
    3,
    '2025-09-19',
    '2025-08-20',
    'Strong communication skills; Fluency in Spanish preferred; Background check required; Previous healthcare experience preferred',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '8dba9c23-90ac-4ec2-b29a-0496cdebde4c',
    '81a205e4-2ff6-4fca-a9e2-86a40027c533',
    'Obstetrics Clinical Rotation',
    'Gain hands-on experience in obstetrics at St. Mary''s Medical Center. Catholic healthcare system focused on compassionate patient care',
    'Obstetrics',
    3,
    '2025-09-19',
    '2025-08-20',
    'Fluency in Spanish preferred; CPR certification required; Strong communication skills',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'bb137fc5-48b9-4770-8b6a-36de31ffa77e',
    '81a205e4-2ff6-4fca-a9e2-86a40027c533',
    'Oncology Nursing Externship',
    'Gain hands-on experience in oncology at St. Mary''s Medical Center. Catholic healthcare system focused on compassionate patient care',
    'Oncology',
    2,
    '2026-01-29',
    '2025-12-30',
    'Strong communication skills; Fluency in Spanish preferred; Medical student in good academic standing',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'd6f9d773-75bd-4815-9176-9678fdd9bc0c',
    '5fdbb1ab-eca9-44a0-85a6-5b37f5c57ee6',
    'Neurology Nursing Externship',
    'Gain hands-on experience in neurology at University Medical Center. Academic medical center affiliated with the medical school',
    'Neurology',
    3,
    '2025-10-18',
    '2025-09-18',
    'Must be enrolled in accredited program; Medical student in good academic standing; Available for weekend shifts',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '835beb14-830a-43c6-bf92-f5c96d65f26d',
    '5fdbb1ab-eca9-44a0-85a6-5b37f5c57ee6',
    'Psychiatry Nursing Externship',
    'Gain hands-on experience in psychiatry at University Medical Center. Academic medical center affiliated with the medical school',
    'Psychiatry',
    2,
    '2025-11-26',
    '2025-10-27',
    'Must be enrolled in accredited program; Strong communication skills; Background check required',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '0adc5a06-d514-4404-9ce3-c2677bbbd744',
    '5fdbb1ab-eca9-44a0-85a6-5b37f5c57ee6',
    'Neurology Clinical Rotation',
    'Gain hands-on experience in neurology at University Medical Center. Academic medical center affiliated with the medical school',
    'Neurology',
    3,
    '2025-12-17',
    '2025-11-17',
    'Fluency in Spanish preferred; Strong communication skills; Previous healthcare experience preferred',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '9184edc8-bfc6-442a-ba68-c70fb224fa32',
    '614762c5-d51e-433f-9d0b-c91d9e99e2b3',
    'Interventional Cardiology Research Internship',
    'Gain hands-on experience in interventional cardiology at Regional Heart Institute. Specialized cardiovascular treatment center',
    'Interventional Cardiology',
    4,
    '2026-01-08',
    '2025-12-09',
    'Background check required; Ability to work in fast-paced environment; Medical student in good academic standing; Completed basic clinical rotations; CPR certification required',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'c82dc721-566a-4e11-a0f4-9e849ace78bb',
    '614762c5-d51e-433f-9d0b-c91d9e99e2b3',
    'Cardiac Surgery Nursing Externship',
    'Gain hands-on experience in cardiac surgery at Regional Heart Institute. Specialized cardiovascular treatment center',
    'Cardiac Surgery',
    2,
    '2025-10-30',
    '2025-09-30',
    'CPR certification required; Ability to work in fast-paced environment; Fluency in Spanish preferred; Background check required',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'b3f4c895-c923-4dc5-8cf8-5fbe38f57a9e',
    'd66e6fd3-4ea6-4c6c-8cb7-49adf4003682',
    'Pediatric Surgery Laboratory Internship',
    'Gain hands-on experience in pediatric surgery at Children''s Hospital Network. Dedicated pediatric healthcare facility',
    'Pediatric Surgery',
    3,
    '2025-12-23',
    '2025-11-23',
    'Ability to work in fast-paced environment; CPR certification required; Must be enrolled in accredited program; Completed basic clinical rotations; Previous healthcare experience preferred',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '2f447546-b344-4404-8acb-44fd4e52085e',
    'd66e6fd3-4ea6-4c6c-8cb7-49adf4003682',
    'Pediatrics Laboratory Internship',
    'Gain hands-on experience in pediatrics at Children''s Hospital Network. Dedicated pediatric healthcare facility',
    'Pediatrics',
    3,
    '2025-10-18',
    '2025-09-18',
    'Must be enrolled in accredited program; Previous healthcare experience preferred; Ability to work in fast-paced environment; Strong communication skills; Medical student in good academic standing',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '762b0e05-179b-4d98-b246-1ee9173b82f7',
    '7d7a79ec-6c63-406a-82f6-7ca29dda08f2',
    'Orthopedics Research Internship',
    'Gain hands-on experience in orthopedics at Riverside Orthopedic Center. Comprehensive orthopedic and sports medicine facility',
    'Orthopedics',
    3,
    '2026-02-05',
    '2026-01-06',
    'Completed basic clinical rotations; Fluency in Spanish preferred; Strong communication skills; Medical student in good academic standing',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'ba7fe034-f5cb-4683-b8e0-642739de1802',
    '7d7a79ec-6c63-406a-82f6-7ca29dda08f2',
    'Orthopedics Nursing Externship',
    'Gain hands-on experience in orthopedics at Riverside Orthopedic Center. Comprehensive orthopedic and sports medicine facility',
    'Orthopedics',
    2,
    '2025-11-22',
    '2025-10-23',
    'Background check required; Medical student in good academic standing; CPR certification required; Completed basic clinical rotations; Available for weekend shifts',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'da088c6f-5db5-485a-965c-ca761b5e2677',
    '78c1133f-0da4-4634-8417-3b309d588d35',
    'Psychiatry Clinical Rotation',
    'Gain hands-on experience in psychiatry at Mental Health Associates. Comprehensive mental health and addiction treatment center',
    'Psychiatry',
    3,
    '2025-09-18',
    '2025-08-19',
    'Completed basic clinical rotations; Ability to work in fast-paced environment; Available for weekend shifts',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '927ca3a2-6630-48a8-a646-cbf46556eb8c',
    '78c1133f-0da4-4634-8417-3b309d588d35',
    'Social Work Research Internship',
    'Gain hands-on experience in social work at Mental Health Associates. Comprehensive mental health and addiction treatment center',
    'Social Work',
    2,
    '2025-11-01',
    '2025-10-02',
    'Completed basic clinical rotations; Must be enrolled in accredited program; Medical student in good academic standing; CPR certification required; Background check required',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    'e6b8acf7-36a1-48ed-bba2-6f1388547bbb',
    '1601b70a-111f-47d1-adf1-e867fb19b38a',
    'Obstetrics Nursing Externship',
    'Gain hands-on experience in obstetrics at Women''s Health Clinic. Specialized women''s healthcare services',
    'Obstetrics',
    2,
    '2025-12-30',
    '2025-11-30',
    'CPR certification required; Background check required; Completed basic clinical rotations',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '4ad61d83-2edd-4eb9-a53c-440275812eb0',
    '1601b70a-111f-47d1-adf1-e867fb19b38a',
    'Maternal-Fetal Medicine Nursing Externship',
    'Gain hands-on experience in maternal-fetal medicine at Women''s Health Clinic. Specialized women''s healthcare services',
    'Maternal-Fetal Medicine',
    3,
    '2025-12-02',
    '2025-11-02',
    'Ability to work in fast-paced environment; CPR certification required; Strong communication skills; Must be enrolled in accredited program',
    'active'
);

INSERT INTO internship_positions (
    id,
    clinic_id,
    title,
    description,
    specialty,
    duration_months,
    start_date,
    application_deadline,
    requirements,
    status
) VALUES (
    '7c3b1fc1-97cc-44a7-8f78-ebc2a67de390',
    '1601b70a-111f-47d1-adf1-e867fb19b38a',
    'Gynecology Administrative Fellowship',
    'Gain hands-on experience in gynecology at Women''s Health Clinic. Specialized women''s healthcare services',
    'Gynecology',
    3,
    '2025-12-26',
    '2025-11-26',
    'Fluency in Spanish preferred; Available for weekend shifts; Must be enrolled in accredited program; Strong communication skills',
    'active'
);

-- Verify the data was inserted
SELECT COUNT(*) as total_users FROM users WHERE role = 'clinic';
SELECT COUNT(*) as total_clinic_profiles FROM clinic_profiles;
SELECT COUNT(*) as total_positions FROM internship_positions;

-- Show sample data
SELECT u.name as clinic_name, cp.address, COUNT(ip.id) as position_count
FROM users u
JOIN clinic_profiles cp ON u.id = cp.user_id
LEFT JOIN internship_positions ip ON cp.id = ip.clinic_id
WHERE u.role = 'clinic'
GROUP BY u.name, cp.address
ORDER BY u.name;

-- Show sample positions
SELECT ip.title, ip.specialty, u.name as clinic_name, ip.start_date
FROM internship_positions ip
JOIN clinic_profiles cp ON ip.clinic_id = cp.id
JOIN users u ON cp.user_id = u.id
LIMIT 5;
