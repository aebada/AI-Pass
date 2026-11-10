"""Draft configuration (S2-03 / S2-04): system prompt rules, model config
validation, and the guarantee that credentials are never stored or echoed.
"""
from __future__ import annotations

import pytest

from app.core.model_config import SYSTEM_PROMPT_MAX_LENGTH

FAKE_OPENAI_KEY = "sk-proj-" + "A1b2C3d4E5f6G7h8I9j0" * 2

VALID_CONFIG = {
    "system_prompt": "You are a helpful assistant.",
    "provider_id": "openai",
    "model_id": "gpt-4o-mini",
    "generation_settings": {"temperature": 0.4, "max_tokens": 512},
}


def _agents_url(org, ws, *parts) -> str:
    base = f"/api/v1/organizations/{org.id}/workspaces/{ws.id}/agents"
    return "/".join([base, *map(str, parts)]) if parts else base


@pytest.fixture()
def ctx(client, auth, world, spaces):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    agent = client.post(_agents_url(org, ws), json={"name": "Bot"}, headers=auth(user)).json()

    class Ctx:
        draft_url = _agents_url(org, ws, agent["id"], "draft")
        headers = auth(user)

        def patch(self, body):
            return client.patch(self.draft_url, json=body, headers=self.headers)

        def draft(self):
            return client.get(self.draft_url, headers=self.headers).json()

    return Ctx()


# --- system prompt (S2-03) ------------------------------------------------------

def test_new_agent_draft_is_empty(ctx):
    draft = ctx.draft()
    assert draft["system_prompt"] is None
    assert draft["provider_id"] is None
    assert draft["is_published"] is False
    assert draft["version_number"] is None


def test_prompt_is_trimmed_and_stored(ctx):
    resp = ctx.patch({"system_prompt": "\n   Be concise.  \t\n"})
    assert resp.status_code == 200
    assert resp.json()["system_prompt"] == "Be concise."
    assert ctx.draft()["system_prompt"] == "Be concise."


@pytest.mark.parametrize("prompt", ["", "   ", "\n\t \r\n"])
def test_empty_or_whitespace_prompt_rejected(ctx, prompt):
    assert ctx.patch({"system_prompt": prompt}).status_code == 422


def test_prompt_length_limit(ctx):
    at_limit = "a" * SYSTEM_PROMPT_MAX_LENGTH
    assert ctx.patch({"system_prompt": at_limit}).status_code == 200
    assert ctx.patch({"system_prompt": at_limit + "a"}).status_code == 422
    # The limit applies after trimming, so surrounding whitespace doesn't count.
    assert ctx.patch({"system_prompt": f"  {at_limit}  "}).status_code == 200


def test_prompt_with_nul_rejected(ctx):
    assert ctx.patch({"system_prompt": "hello\x00world"}).status_code == 422


def test_rejected_prompt_leaves_draft_unchanged(ctx):
    ctx.patch({"system_prompt": "Original"})
    ctx.patch({"system_prompt": "   "})
    assert ctx.draft()["system_prompt"] == "Original"


def test_explicit_null_clears_prompt(ctx):
    ctx.patch({"system_prompt": "Original"})
    resp = ctx.patch({"system_prompt": None})
    assert resp.status_code == 200
    assert resp.json()["system_prompt"] is None


def test_partial_patch_keeps_other_fields(ctx):
    ctx.patch(VALID_CONFIG)
    resp = ctx.patch({"system_prompt": "New prompt"}).json()
    assert resp["provider_id"] == "openai"
    assert resp["model_id"] == "gpt-4o-mini"
    assert resp["generation_settings"] == {"temperature": 0.4, "max_tokens": 512}


# --- model configuration (S2-04) ---------------------------------------------------

def test_valid_model_config_stored(ctx):
    resp = ctx.patch({**VALID_CONFIG, "provider_id": "  OpenAI "})
    assert resp.status_code == 200
    data = resp.json()
    assert data["provider_id"] == "openai"
    assert data["model_id"] == "gpt-4o-mini"
    assert data["generation_settings"] == {"temperature": 0.4, "max_tokens": 512}


@pytest.mark.parametrize(
    "body",
    [
        {"provider_id": "not-a-provider"},
        {"provider_id": ""},
        {"model_id": ""},
        {"model_id": "gpt 4o"},
        {"model_id": "-leading-dash"},
        {"model_id": "m" * 129},
    ],
)
def test_invalid_provider_or_model_rejected(ctx, body):
    assert ctx.patch(body).status_code == 422


@pytest.mark.parametrize(
    "settings",
    [
        {"temperature": -0.1},
        {"temperature": 2.1},
        {"temperature": "0.5"},
        {"temperature": True},
        {"top_p": 1.5},
        {"max_tokens": 0},
        {"max_tokens": 1_000_000},
        {"max_tokens": 10.5},
        {"presence_penalty": 3},
        {"frequency_penalty": -3},
        {"stop": ["a", "b", "c", "d", "e"]},
        {"stop": [""]},
        {"stop": ["x" * 65]},
        {"seed_everything": 1},
    ],
)
def test_unsafe_generation_settings_rejected(ctx, settings):
    assert ctx.patch({"generation_settings": settings}).status_code == 422


def test_generation_settings_accepts_full_safe_set(ctx):
    settings = {
        "temperature": 0,
        "top_p": 1,
        "max_tokens": 32768,
        "presence_penalty": -2,
        "frequency_penalty": 2,
        "stop": ["\n\nUser:"],
    }
    resp = ctx.patch({"generation_settings": settings})
    assert resp.status_code == 200
    assert resp.json()["generation_settings"] == settings


def test_null_generation_settings_resets_to_empty(ctx):
    ctx.patch(VALID_CONFIG)
    assert ctx.patch({"generation_settings": None}).json()["generation_settings"] == {}


@pytest.mark.parametrize(
    "body",
    [
        {"tool_bindings": [{"tool_id": "web-search"}, {"tool_id": "web-search"}]},
        {"tool_bindings": [{"tool_id": "Web Search"}]},
        {"tool_bindings": [{"tool_id": "crm", "config": {"token": "x"}}]},
        {"knowledge_base_bindings": [{"knowledge_base_id": "kb-1", "credentials": "x"}]},
        {"knowledge_base_bindings": [{"knowledge_base_id": "kb-1"}] * 2},
    ],
)
def test_invalid_bindings_rejected(ctx, body):
    assert ctx.patch(body).status_code == 422


def test_bindings_stored_as_normalized_snapshots(ctx):
    resp = ctx.patch(
        {
            "tool_bindings": [{"tool_id": "web-search"}],
            "knowledge_base_bindings": [{"knowledge_base_id": "kb-handbook", "name": "Handbook"}],
        }
    ).json()
    assert resp["tool_bindings"] == [{"tool_id": "web-search", "enabled": True}]
    assert resp["knowledge_base_bindings"] == [
        {"knowledge_base_id": "kb-handbook", "name": "Handbook", "is_placeholder": False}
    ]


def test_create_accepts_initial_config(client, auth, world, spaces):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    agent = client.post(
        _agents_url(org, ws), json={"name": "Configured", **VALID_CONFIG}, headers=auth(user)
    ).json()

    draft = client.get(_agents_url(org, ws, agent["id"], "draft"), headers=auth(user)).json()
    assert draft["system_prompt"] == VALID_CONFIG["system_prompt"]
    assert draft["model_id"] == "gpt-4o-mini"


def test_create_validates_initial_config(client, auth, world, spaces):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    resp = client.post(
        _agents_url(org, ws), json={"name": "Bad", "system_prompt": "   "}, headers=auth(user)
    )
    assert resp.status_code == 422
    listed = client.get(_agents_url(org, ws), headers=auth(user)).json()
    assert listed == []


# --- secrets ------------------------------------------------------------------

@pytest.mark.parametrize(
    "body",
    [
        {"api_key": FAKE_OPENAI_KEY},
        {"generation_settings": {"api_key": FAKE_OPENAI_KEY}},
        {"system_prompt": f"Use this key: {FAKE_OPENAI_KEY}"},
        {"model_id": FAKE_OPENAI_KEY},
        {"change_note": f"rotated to {FAKE_OPENAI_KEY}"},
        {"system_prompt": "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.signature"},
        {"system_prompt": "aws AKIAABCDEFGHIJKLMNOP"},
        {"generation_settings": {"stop": [FAKE_OPENAI_KEY]}},
    ],
)
def test_secrets_rejected_and_never_echoed(ctx, body):
    resp = ctx.patch(body)

    assert resp.status_code == 422
    assert FAKE_OPENAI_KEY not in resp.text
    assert "AKIAABCDEFGHIJKLMNOP" not in resp.text
    draft = ctx.draft()
    assert FAKE_OPENAI_KEY not in str(draft)


def test_secret_rejected_on_create(client, auth, world, spaces):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    resp = client.post(
        _agents_url(org, ws),
        json={"name": "Leaky", "provider_api_key": FAKE_OPENAI_KEY},
        headers=auth(user),
    )
    assert resp.status_code == 422
    assert FAKE_OPENAI_KEY not in resp.text


def test_prose_mentioning_keys_is_allowed(ctx):
    prompt = "Never ask users for their API key or password. Keys look like sk-... ."
    assert ctx.patch({"system_prompt": prompt}).status_code == 200


def test_responses_expose_no_secret_fields(ctx):
    data = ctx.patch(VALID_CONFIG).json()
    assert not {k for k in data if any(w in k for w in ("key", "secret", "token", "password"))}
