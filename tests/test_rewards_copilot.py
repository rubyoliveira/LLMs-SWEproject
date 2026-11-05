"""
RocketRewards AI Copilot - Red Phase TDD Test Suite (28 Unit Assertions)
Domain: 6 Critical Areas (Leap Years, Negative Balances, MCC Exclusions,
Safe-Spend 10% Thresholds, Statement Credits, and NLP Failsafes)
"""

import pytest
from datetime import date
from decimal import Decimal


# Domain 1: Leap-Year & Date Boundary Rollovers
def test_01_leap_year_february_29_statement_close():
    """Assertion 1: Statement closing on Feb 28 of a leap year must correctly advance to Feb 29."""
    from backend.engine import calculate_statement_due_dates
    close_date, _ = calculate_statement_due_dates(as_of_date=date(2024, 2, 15), statement_day=29)
    assert close_date == date(2024, 2, 29)


def test_02_non_leap_year_february_28_clamping():
    """Assertion 2: A card configured with 31st statement day in February must clamp to Feb 28 in non-leap year."""
    from backend.engine import calculate_statement_due_dates
    close_date, _ = calculate_statement_due_dates(as_of_date=date(2025, 2, 10), statement_day=31)
    assert close_date == date(2025, 2, 28)


def test_03_due_date_grace_period_cross_month_rollover():
    """Assertion 3: Exactly 25-day grace period crossing leap day must maintain precise arithmetic."""
    from backend.engine import calculate_statement_due_dates
    _, due_date = calculate_statement_due_dates(as_of_date=date(2024, 2, 10), statement_day=15, grace_days=25)
    assert due_date == date(2024, 3, 11)


def test_04_due_date_falling_on_weekend_moves_to_next_business_day():
    """Assertion 4: Due date landing on Sunday must adjust to Monday per CARD Act rules."""
    from backend.engine import calculate_statement_due_dates
    _, due_date = calculate_statement_due_dates(as_of_date=date(2024, 5, 1), statement_day=7, grace_days=25)
    assert due_date.weekday() < 5


# Domain 2: Negative Balances, Overpayments & Refund Handling
def test_05_negative_balance_prevents_interest_and_permits_zero_payment():
    """Assertion 5: Card with credit balance (-$84.50 from returns) requires $0.00 min payment."""
    from backend.engine import evaluate_safe_spend_guardrail
    guardrail = evaluate_safe_spend_guardrail(
        current_balance=Decimal("-84.50"),
        credit_limit=Decimal("500.00"),
        purchase_amount=Decimal("50.00"),
        checking_balance=Decimal("600.00"),
    )
    assert guardrail["min_payment_due"] == Decimal("0.00")
    assert guardrail["post_purchase_balance"] == Decimal("-34.50")


def test_06_negative_balance_utilization_reported_as_zero_percent():
    """Assertion 6: Credit bureaus truncate negative utilization; engine must report 0.0%."""
    from backend.engine import evaluate_safe_spend_guardrail
    guardrail = evaluate_safe_spend_guardrail(
        current_balance=Decimal("-120.00"),
        credit_limit=Decimal("1000.00"),
        purchase_amount=Decimal("0.00"),
        checking_balance=Decimal("800.00"),
    )
    assert guardrail["reported_utilization_pct"] == 0.0


def test_07_refund_restores_annual_category_spending_cap():
    """Assertion 7: Returning a $200 grocery item must restore $200 back to the card's annual bonus cap."""
    from backend.engine import apply_category_spending_caps
    net_cap = apply_category_spending_caps(
        card_id="amex-gold",
        category="groceries",
        annual_cap=Decimal("25000.00"),
        ytd_spend=Decimal("24900.00"),
        refund_amount=Decimal("200.00"),
    )
    assert net_cap["remaining_cap"] == Decimal("300.00")


# Domain 3: Deterministic MCC Resolution & Merchant Exclusions
def test_08_supermarket_mcc_5411_resolves_bonus_multiplier():
    """Assertion 8: Whole Foods Market must resolve to MCC 5411 and award 4x multiplier."""
    from backend.engine import resolve_merchant_mcc
    resolution = resolve_merchant_mcc("Whole Foods Market")
    assert resolution["mcc"] == "5411"
    assert resolution["is_supermarket_eligible"] is True


def test_09_wholesale_club_costco_excluded_from_supermarket_mcc():
    """Assertion 9: Wholesale clubs like Costco (MCC 5300) must NOT trigger 4x supermarket bonus."""
    from backend.engine import resolve_merchant_mcc
    resolution = resolve_merchant_mcc("Costco Wholesale")
    assert resolution["mcc"] == "5300"
    assert resolution["is_supermarket_eligible"] is False


def test_10_target_walmart_supercenters_excluded_from_grocery_bonus():
    """Assertion 10: Superstores (Target/Walmart) must code as discount retail, not grocery."""
    from backend.engine import resolve_merchant_mcc
    resolution = resolve_merchant_mcc("Walmart Supercenter")
    assert resolution["mcc"] == "5311"
    assert resolution["category"] == "Shopping & Retail"


def test_11_fast_food_mcc_5814_recognized_as_dining():
    """Assertion 11: Shake Shack / Burger King must resolve to MCC 5814 (Fast Food / Dining)."""
    from backend.engine import resolve_merchant_mcc
    resolution = resolve_merchant_mcc("Shake Shack")
    assert resolution["mcc"] == "5814"
    assert resolution["category"] == "Dining & Restaurants"


def test_12_non_category_donation_triggers_use_any_card():
    """Assertion 12: Religious donations (MCC 8661) must flag is_use_any_card=True."""
    from backend.engine import calculate_best_card_swipe
    swipe = calculate_best_card_swipe(
        prompt="Donating $50 to church",
        user_cards=[{"id": "amex-gold", "dining": 4, "base": 1}, {"id": "citi-dc", "base": 2}],
    )
    assert swipe["is_use_any_card"] is True
    assert "church" in swipe["non_category_blurb"].lower()


# Domain 4: Safe-Spend Guardrails & Credit Health (10% Rule)
def test_13_utilization_over_10_percent_triggers_caution_status():
    """Assertion 13: $180 swipe on a $500 limit yields 36% utilization and must trigger caution."""
    from backend.engine import evaluate_safe_spend_guardrail
    eval_result = evaluate_safe_spend_guardrail(
        current_balance=Decimal("0.00"),
        credit_limit=Decimal("500.00"),
        purchase_amount=Decimal("180.00"),
        checking_balance=Decimal("820.00"),
    )
    assert eval_result["post_buy_utilization_pct"] == 36.0
    assert eval_result["is_over_safe_threshold"] is True


def test_14_scheduled_payment_restores_safe_10_percent_target():
    """Assertion 14: Engine must schedule exact paydown ($130) so reported balance is $50 (10%)."""
    from backend.engine import evaluate_safe_spend_guardrail
    eval_result = evaluate_safe_spend_guardrail(
        current_balance=Decimal("0.00"),
        credit_limit=Decimal("500.00"),
        purchase_amount=Decimal("180.00"),
        checking_balance=Decimal("820.00"),
    )
    assert eval_result["recommended_scheduled_payment"] == Decimal("130.00")
    assert eval_result["target_reported_balance"] == Decimal("50.00")


def test_15_purchase_exceeding_credit_limit_triggers_hard_decline():
    """Assertion 15: Flight for $640 on a $500 limit must trigger hard decline and over-limit status."""
    from backend.engine import evaluate_safe_spend_guardrail
    eval_result = evaluate_safe_spend_guardrail(
        current_balance=Decimal("20.00"),
        credit_limit=Decimal("500.00"),
        purchase_amount=Decimal("640.00"),
        checking_balance=Decimal("1200.00"),
    )
    assert eval_result["is_over_limit"] is True
    assert eval_result["over_amount"] == Decimal("160.00")


def test_16_checking_account_emergency_buffer_protection():
    """Assertion 16: Engine must refuse scheduled payment if checking drops below $200 buffer."""
    from backend.engine import evaluate_safe_spend_guardrail
    eval_result = evaluate_safe_spend_guardrail(
        current_balance=Decimal("0.00"),
        credit_limit=Decimal("500.00"),
        purchase_amount=Decimal("180.00"),
        checking_balance=Decimal("250.00"),
        emergency_buffer=Decimal("200.00"),
    )
    assert eval_result["can_schedule_from_checking"] is False


# Domain 5: Annual Credits, Proration & Multiplier Precision
def test_17_expiring_credit_applied_before_points_multiplication():
    """Assertion 17: $10 dining credit on $24 check means user pays $14; points earn on $14 only."""
    from backend.engine import calculate_best_card_swipe
    result = calculate_best_card_swipe(
        prompt="Ordering lunch at Shake Shack for $24",
        user_cards=[{
            "id": "amex-gold",
            "dining_mult": 4,
            "active_credits": [{"type": "dining", "remaining": Decimal("10.00")}],
        }],
    )
    assert result["credit_applied"] == Decimal("10.00")
    assert result["net_charge"] == Decimal("14.00")
    assert result["points_earned"] == 56


def test_18_half_cent_sub_penny_rounding_precision():
    """Assertion 18: Cash back on $33.33 at 1.5% is 49.995 cents; must round bankers half-to-even ($0.50)."""
    from backend.engine import calculate_best_card_swipe
    swipe = calculate_best_card_swipe(
        prompt="Office supplies for $33.33",
        user_cards=[{"id": "citi-custom", "base_pct": Decimal("1.5")}],
    )
    assert swipe["cash_back_dollars"] == Decimal("0.50")


def test_19_annual_credit_cannot_offset_beyond_purchase_cost():
    """Assertion 19: A $15 credit applied to an $8 coffee must only consume $8 of credit, leaving $7."""
    from backend.engine import calculate_best_card_swipe
    result = calculate_best_card_swipe(
        prompt="Coffee for $8",
        user_cards=[{
            "id": "amex-gold",
            "active_credits": [{"type": "dining", "remaining": Decimal("15.00")}],
        }],
    )
    assert result["credit_applied"] == Decimal("8.00")
    assert result["net_charge"] == Decimal("0.00")
    assert result["remaining_credit"] == Decimal("7.00")


def test_20_annual_fee_break_even_net_value_formula():
    """Assertion 20: Net annual value must equal (Gross Points * Valuation) + Credits - Fee."""
    from backend.card_matcher import calculate_card_match
    match = calculate_card_match(card_id="amex-gold", annual_dining=Decimal("5400.00"))
    assert match["net_annual_value"] == Decimal("249.20")


def test_21_category_cap_overflow_drops_to_baseline_rate():
    """Assertion 21: Grocery spend past $25,000 on Amex Gold must drop from 4x to 1x."""
    from backend.card_matcher import calculate_points_with_caps
    points = calculate_points_with_caps(card_id="amex-gold", category="groceries", spend_amount=Decimal("26000.00"))
    assert points == 101000


# Domain 6: NLP Guardrails, Ambiguity & Routing
def test_22_nonsense_query_without_purchase_intent_flagged_invalid():
    """Assertion 22: Failsafe must flag 'i have an exam today' as having 0 categories, merchants, or money."""
    from backend.engine import validate_natural_language_query
    validation = validate_natural_language_query("i have an exam today")
    assert validation["is_valid"] is False
    assert validation["has_category"] is False
    assert validation["has_merchant"] is False


def test_23_query_with_only_category_passes_validation():
    """Assertion 23: Query 'dinner with friends' has category (Dining) and passes validation."""
    from backend.engine import validate_natural_language_query
    validation = validate_natural_language_query("dinner with friends")
    assert validation["is_valid"] is True
    assert validation["has_category"] is True


def test_24_query_with_only_merchant_passes_validation():
    """Assertion 24: Query 'heading to Lowe's' has known store and passes validation."""
    from backend.engine import validate_natural_language_query
    validation = validate_natural_language_query("heading to Lowe's")
    assert validation["is_valid"] is True
    assert validation["has_merchant"] is True


def test_25_query_with_only_money_amount_passes_validation():
    """Assertion 25: Query 'can i spend $75' has money value and passes validation."""
    from backend.engine import validate_natural_language_query
    validation = validate_natural_language_query("can i spend $75")
    assert validation["is_valid"] is True
    assert validation["has_money_or_intent"] is True


def test_26_ambiguous_merchant_shack_returns_disambiguation_options():
    """Assertion 26: Ambiguous prompt 'Shack $24' must prompt user between Shake Shack and Shack Shop."""
    from backend.engine import calculate_best_card_swipe
    result = calculate_best_card_swipe(
        prompt="Lunch at Shack for $24",
        user_cards=[{"id": "amex-gold"}, {"id": "citi-dc"}],
    )
    assert result["is_ambiguous"] is True
    assert "Shake Shack" in result["ambiguous_options"]
    assert "Shack Shop" in result["ambiguous_options"]


def test_27_rent_payment_zero_fee_bilt_optimization():
    """Assertion 27: Rent payments must route to Bilt Mastercard to avoid 3% transaction fee."""
    from backend.engine import calculate_best_card_swipe
    swipe = calculate_best_card_swipe(
        prompt="Paying $1400 apartment rent",
        user_cards=[{"id": "bilt-mastercard"}, {"id": "citi-dc"}],
    )
    assert swipe["recommended_card_id"] == "bilt-mastercard"
    assert swipe["waived_processing_fee"] == Decimal("42.00")


def test_28_tie_breaker_prefers_lower_utilization_card():
    """Assertion 28: When two cards provide identical 2% return, tie-breaker picks card with lower utilization."""
    from backend.engine import calculate_best_card_swipe
    swipe = calculate_best_card_swipe(
        prompt="Target purchase for $100",
        user_cards=[
            {"id": "card-a", "base": 2, "limit": 1000, "balance": 400},
            {"id": "card-b", "base": 2, "limit": 2000, "balance": 100},
        ],
    )
    assert swipe["recommended_card_id"] == "card-b"
