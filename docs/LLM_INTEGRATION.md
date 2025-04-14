# LLM Integration Documentation

## Overview

This document outlines the completed LLM (Large Language Model) integration for the Vici App. The integration uses Google's Gemini API to power two key features:

1. **Training Plan Generation**: Creates personalized running training plans based on user data, goals, and preferences
2. **Ask Vici**: Allows users to ask questions and request adjustments to their training plans

## Implementation Details

### Core Components

- **LLMService**: Central service for interacting with the Gemini API
  - Handles prompt engineering
  - Manages API calls with retry logic
  - Parses and validates responses

- **TrainingService**: Uses LLMService for domain-specific operations
  - Prepares data for LLM input
  - Maps AI responses to database structures
  - Manages plan creation and updates

### Key Features

#### Training Plan Generation

- Collects user profile, goals, preferences, and activity history
- Builds a detailed prompt with clear constraints and output format requirements
- Uses Zod schema validation to ensure valid response structure
- Maps the response to Prisma model structure for database storage

#### Ask Vici (AI Coach)

- Provides natural language interface for training plan questions and adjustments
- Includes context about the user's profile and current plan in prompts
- Supports both simple text responses and structured plan modifications
- Implements safety checks to prevent harmful adjustments

### Error Handling & Resilience

- **API Key Validation**: Checks for API key presence and logs warnings
- **Retry Logic**: Implements exponential backoff for network-related failures
- **Validation**: Uses Zod schemas to validate LLM responses
- **Response Parsing**: Handles various response formats including markdown code blocks

### Testing

- **Integration Tests**: Verify end-to-end functionality using mocked LLM responses
- **Unit Tests**: Validate individual components (prompt building, response parsing)
- **Test Commands**:
  - `npm run test:integration`: Run all integration tests
  - `npm run test:llm`: Run only LLM integration tests

## Usage

### Environment Setup

Ensure the following environment variables are set:
```
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

### API Endpoints

#### Create Training Plan
```
POST /api/training-plans
Body: {
  "goal": { "type": "Race", ... },
  "preferences": { "runningDaysPerWeek": 4, ... }
}
```

#### Ask Vici
```
POST /api/training-plans/:planId/ask-vici
Body: {
  "query": "Can you make next week easier? I'm feeling tired."
}
```

## Future Improvements

1. **Response Quality Enhancements**:
   - Fine-tune prompts based on user feedback
   - Add more contextual information to prompts

2. **Performance Optimization**:
   - Cache common responses
   - Implement asynchronous processing for plan generation

3. **Feature Expansion**:
   - Add support for more workout types
   - Implement nutrition and recovery recommendations
   - Enable race strategy generation

## Troubleshooting

Common issues and solutions:

1. **LLM Service Not Available**:
   - Check if GOOGLE_GEMINI_API_KEY is properly set in environment variables
   - Verify API key is valid and has necessary permissions

2. **Invalid Response Structure**:
   - Review logs for JSON parsing errors
   - Examine raw LLM response for format issues
   - Update Zod schema if the expected structure has changed

3. **Rate Limiting**:
   - Implement additional rate limiting in high-traffic scenarios
   - Consider upgrading API tier for higher quotas 