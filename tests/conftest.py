import pytest


@pytest.fixture
def sample_chunks():
    """Sample text chunks for testing the chunker."""
    return [
        "NovaTech Solutions offers 20 days of PTO per year for all full-time employees.",
        "The remote work policy allows employees to work from home 2 days per week.",
        "All pull requests require a minimum of 2 reviewers before merging.",
    ]


@pytest.fixture
def sample_long_text():
    """A realistic multi-paragraph text for testing chunking."""
    return """NovaTech Solutions Remote Work Policy

Effective Date: January 1, 2025
Document Owner: People Operations

Overview

NovaTech Solutions embraces a hybrid work model that balances the benefits of in-person collaboration with the flexibility of remote work. This policy outlines the guidelines and expectations for all employees regarding remote and hybrid work arrangements.

Hybrid Work Schedule

All full-time employees follow a hybrid schedule of 3 days in-office and 2 days remote per week. Tuesday and Thursday are designated as mandatory in-office days to facilitate team collaboration and cross-functional meetings. The remaining in-office day is determined by each team's preference and should be consistent week-to-week.

Fully Remote Eligibility

Employees who have completed at least 6 months of tenure may apply for fully remote status. Approval requires sign-off from both the direct manager and the relevant VP. Fully remote employees are expected to travel to their assigned office at least once per quarter for team events and planning sessions.

Home Office Equipment

NovaTech provides a one-time home office stipend of $1,500 for ergonomic furniture and equipment. Additionally, employees receive a monthly internet reimbursement of $50. All equipment purchased with the stipend remains the property of the employee.

Core Hours and Communication

All employees, regardless of location, are expected to be available during core hours of 10 AM to 4 PM in their local timezone. Slack messages should receive a response within 2 hours during working hours. For urgent matters, phone calls are preferred over Slack messages.

International Remote Work

Employees may work remotely from international locations for up to 4 weeks per calendar year. Requests must be submitted at least 3 weeks in advance and require approval from the Legal team due to tax and compliance implications."""


@pytest.fixture
def sample_query_payload():
    """Sample query payload for API testing."""
    return {
        "q": "What is the remote work policy?",
        "thread_id": "test_session_001"
    }
