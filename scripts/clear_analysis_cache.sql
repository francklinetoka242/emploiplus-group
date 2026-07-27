-- Script: clear_analysis_cache.sql
-- Purpose: Clear all cached AI analysis results
--
-- USAGE:
-- This script should be executed in the Supabase SQL Editor when:
-- 1. Major updates to the Groq prompt system are deployed
-- 2. Significant changes to RH evaluation logic occur
-- 3. A new version of PROMPT_VERSION is introduced in groqAnalysisService.ts
-- 4. The model or API configuration of Groq changes
--
-- IMPORTANT: Run this script AFTER deploying the new prompt changes and BEFORE
-- users start running new analyses. This ensures all new analyses use the updated logic.
--
-- WARNING: This will remove ALL cached analyses. Users will need to trigger
-- new analyses for their candidates, but results will be based on the latest logic.

-- Clear all cached AI analysis results
TRUNCATE TABLE ai_analysis_cache;

-- If you want to preserve specific analyses (e.g., for testing), you can instead use:
-- DELETE FROM ai_analysis_cache WHERE created_at < NOW() - INTERVAL '7 days';
-- Or delete by prompt version:
-- DELETE FROM ai_analysis_cache WHERE prompt_version != 'current_version_here';
