"""
Friendly JSON Widgets for Django Admin
=======================================
Replace raw JSON textareas with user-friendly visual editors.
"""
import json
from django import forms
from django.utils.safestring import mark_safe


class FriendlyJSONMixin:
    """Base mixin for all friendly JSON widgets."""

    def format_value(self, value):
        if value is None:
            return self.get_empty_value()
        if isinstance(value, str):
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return self.get_empty_value()
        return value

    def get_empty_value(self):
        return {}

    def value_from_datadict(self, data, files, name):
        """Override in subclass to reconstruct JSON from form data."""
        raise NotImplementedError


# ═══════════════════════════════════════════════════════════════════
# TAG LIST WIDGET — for simple string lists
# e.g. columns_json, group_by, sort_by, affected_features,
#      allowed_user_types, playlist_ids
# ═══════════════════════════════════════════════════════════════════
class TagListWidget(FriendlyJSONMixin, forms.Widget):
    """Renders a list of strings as tag-style chips with add/remove."""
    template_name = 'admin/widgets/tag_list.html'

    def __init__(self, attrs=None, placeholder='Type and press Enter…',
                 suggestions=None):
        super().__init__(attrs)
        self.placeholder = placeholder
        self.suggestions = suggestions or []

    def get_empty_value(self):
        return []

    def get_context(self, name, value, attrs):
        value = self.format_value(value)
        if not isinstance(value, list):
            value = []
        context = super().get_context(name, value, attrs)
        context['widget'].update({
            'items': value,
            'placeholder': self.placeholder,
            'suggestions': json.dumps(self.suggestions),
        })
        return context

    def value_from_datadict(self, data, files, name):
        # Items are sent as hidden fields with name="<name>_items"
        items = data.getlist(f'{name}_items')
        # Filter out empty strings
        return json.dumps([i.strip() for i in items if i.strip()])


# ═══════════════════════════════════════════════════════════════════
# EMAIL LIST WIDGET — for email lists with validation display
# e.g. recipients_email
# ═══════════════════════════════════════════════════════════════════
class EmailListWidget(FriendlyJSONMixin, forms.Widget):
    """Renders a list of emails as tag chips with email validation."""
    template_name = 'admin/widgets/email_list.html'

    def get_empty_value(self):
        return []

    def get_context(self, name, value, attrs):
        value = self.format_value(value)
        if not isinstance(value, list):
            value = []
        context = super().get_context(name, value, attrs)
        context['widget'].update({
            'emails': value,
        })
        return context

    def value_from_datadict(self, data, files, name):
        items = data.getlist(f'{name}_items')
        return json.dumps([i.strip() for i in items if i.strip()])


# ═══════════════════════════════════════════════════════════════════
# KEY-VALUE WIDGET — for flat dicts
# e.g. config_json, usage_stats, setting_json, filters_json
# ═══════════════════════════════════════════════════════════════════
class KeyValueWidget(FriendlyJSONMixin, forms.Widget):
    """Renders a dict as key/value rows with add/remove."""
    template_name = 'admin/widgets/key_value.html'

    def __init__(self, attrs=None, key_placeholder='Key',
                 value_placeholder='Value'):
        super().__init__(attrs)
        self.key_placeholder = key_placeholder
        self.value_placeholder = value_placeholder

    def get_empty_value(self):
        return {}

    def get_context(self, name, value, attrs):
        value = self.format_value(value)
        if not isinstance(value, dict):
            value = {}
        pairs = list(value.items())
        context = super().get_context(name, value, attrs)
        context['widget'].update({
            'pairs': pairs,
            'key_placeholder': self.key_placeholder,
            'value_placeholder': self.value_placeholder,
        })
        return context

    def value_from_datadict(self, data, files, name):
        keys = data.getlist(f'{name}_keys')
        vals = data.getlist(f'{name}_vals')
        result = {}
        for k, v in zip(keys, vals):
            k = k.strip()
            if k:
                # Try to auto-convert numbers and booleans
                if v.lower() in ('true', 'false'):
                    result[k] = v.lower() == 'true'
                else:
                    try:
                        result[k] = int(v)
                    except ValueError:
                        try:
                            result[k] = float(v)
                        except ValueError:
                            result[k] = v
        return json.dumps(result)


# ═══════════════════════════════════════════════════════════════════
# SOCIAL LINKS WIDGET — for social media dicts
# e.g. social_links, social_links_json
# ═══════════════════════════════════════════════════════════════════
class SocialLinksWidget(FriendlyJSONMixin, forms.Widget):
    """Renders social media links as labeled icon rows."""
    template_name = 'admin/widgets/social_links.html'

    PLATFORMS = [
        ('facebook', 'fab fa-facebook', '#1877f2', 'Facebook URL'),
        ('twitter', 'fab fa-x-twitter', '#000000', 'Twitter / X URL'),
        ('instagram', 'fab fa-instagram', '#e4405f', 'Instagram URL'),
        ('youtube', 'fab fa-youtube', '#ff0000', 'YouTube URL'),
        ('linkedin', 'fab fa-linkedin', '#0a66c2', 'LinkedIn URL'),
        ('whatsapp', 'fab fa-whatsapp', '#25d366', 'WhatsApp URL'),
        ('telegram', 'fab fa-telegram', '#0088cc', 'Telegram URL'),
    ]

    def get_empty_value(self):
        return {}

    def get_context(self, name, value, attrs):
        value = self.format_value(value)
        if not isinstance(value, dict):
            value = {}
        platforms = []
        for key, icon, color, placeholder in self.PLATFORMS:
            platforms.append({
                'key': key,
                'icon': icon,
                'color': color,
                'placeholder': placeholder,
                'value': value.get(key, ''),
            })
        context = super().get_context(name, value, attrs)
        context['widget'].update({
            'platforms': platforms,
        })
        return context

    def value_from_datadict(self, data, files, name):
        result = {}
        for key, _, _, _ in self.PLATFORMS:
            val = data.get(f'{name}_{key}', '').strip()
            if val:
                result[key] = val
        return json.dumps(result)


# ═══════════════════════════════════════════════════════════════════
# LINKS LIST WIDGET — for footer links [{label, url, icon?}]
# e.g. links_json
# ═══════════════════════════════════════════════════════════════════
class LinksListWidget(FriendlyJSONMixin, forms.Widget):
    """Renders a list of {label, url, icon?} as a dynamic table."""
    template_name = 'admin/widgets/links_list.html'

    def get_empty_value(self):
        return []

    def get_context(self, name, value, attrs):
        value = self.format_value(value)
        if not isinstance(value, list):
            value = []
        context = super().get_context(name, value, attrs)
        context['widget'].update({
            'links': value,
        })
        return context

    def value_from_datadict(self, data, files, name):
        labels = data.getlist(f'{name}_labels')
        urls = data.getlist(f'{name}_urls')
        icons = data.getlist(f'{name}_icons')
        result = []
        for i in range(len(labels)):
            label = labels[i].strip() if i < len(labels) else ''
            url = urls[i].strip() if i < len(urls) else ''
            icon = icons[i].strip() if i < len(icons) else ''
            if label and url:
                item = {'label': label, 'url': url}
                if icon:
                    item['icon'] = icon
                result.append(item)
        return json.dumps(result)


# ═══════════════════════════════════════════════════════════════════
# FILTERS WIDGET — for report filter conditions (dict)
# e.g. filters_json: {"date_from":"2025-01-01","date_to":"2025-12-31",
#                      "status":"active","center":"all"}
# ═══════════════════════════════════════════════════════════════════
class FiltersWidget(KeyValueWidget):
    """Specialized key-value widget for report filter conditions."""

    def __init__(self, attrs=None):
        super().__init__(
            attrs=attrs,
            key_placeholder='Filter name (e.g. date_from, status)',
            value_placeholder='Filter value'
        )
