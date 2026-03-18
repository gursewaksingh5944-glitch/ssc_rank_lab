-- =========================================
-- SSC RANK LAB - POST TARGET SEED DATA
-- =========================================

-- Clear existing (optional for reset)
DELETE FROM post_targets WHERE exam_key = 'ssc_cgl';

-- =========================================
-- SSC CGL TARGET POSTS
-- =========================================

INSERT INTO post_targets
(exam_key, post_name, safe_score_min, safe_score_max, priority_1, priority_2, priority_3)
VALUES

-- TOP POSTS
('ssc_cgl', 'Assistant Section Officer (ASO)', 160, 175, 'english', 'reasoning', 'quant'),
('ssc_cgl', 'Income Tax Inspector', 155, 170, 'quant', 'reasoning', 'english'),
('ssc_cgl', 'Examiner (Customs)', 155, 170, 'quant', 'reasoning', 'gk'),
('ssc_cgl', 'Preventive Officer', 150, 165, 'quant', 'reasoning', 'english'),
('ssc_cgl', 'CBI Sub Inspector', 150, 165, 'reasoning', 'quant', 'gk'),

-- MID TIER
('ssc_cgl', 'Inspector (Central Excise)', 145, 160, 'quant', 'reasoning', 'english'),
('ssc_cgl', 'Inspector (Narcotics)', 140, 155, 'quant', 'gk', 'reasoning'),
('ssc_cgl', 'Divisional Accountant', 140, 155, 'quant', 'reasoning', 'english'),
('ssc_cgl', 'Junior Statistical Officer (JSO)', 145, 160, 'quant', 'english', 'reasoning'),

-- LOWER MID
('ssc_cgl', 'Auditor (CAG / CGDA / CGA)', 135, 150, 'quant', 'english', 'reasoning'),
('ssc_cgl', 'Accountant / Junior Accountant', 130, 145, 'quant', 'reasoning', 'english'),
('ssc_cgl', 'Senior Secretariat Assistant', 130, 145, 'english', 'reasoning', 'quant'),

-- ENTRY LEVEL
('ssc_cgl', 'Tax Assistant', 125, 140, 'quant', 'reasoning', 'english'),
('ssc_cgl', 'Upper Division Clerk (UDC)', 120, 135, 'english', 'reasoning', 'quant');

-- =========================================
-- SSC CHSL TARGET POSTS (optional future)
-- =========================================

INSERT INTO post_targets
(exam_key, post_name, safe_score_min, safe_score_max, priority_1, priority_2, priority_3)
VALUES
('ssc_chsl', 'Data Entry Operator (DEO)', 140, 155, 'english', 'reasoning', 'quant'),
('ssc_chsl', 'Lower Division Clerk (LDC)', 120, 135, 'english', 'reasoning', 'quant'),
('ssc_chsl', 'Postal Assistant', 130, 145, 'reasoning', 'english', 'quant'),
('ssc_chsl', 'Sorting Assistant', 130, 145, 'reasoning', 'english', 'quant');

-- =========================================
-- END OF SEED DATA
-- =========================================