(function () {
  if (window.__aipassDemoRealtime) return;
  window.__aipassDemoRealtime = true;

  var ENTITY = [
    { match: /\bve[-\s]?991\b/i, id: 've-991', label: 'VE-991', x: 80, y: 70 },
    { match: /\bdu[-\s]?7\b|\bdrive unit\b/i, id: 'du-7', label: 'Drive Unit DU-7', x: 560, y: 70 },
    { match: /\bskf[-\s]?6205\b|\bbearing\b/i, id: 'skf-6205', label: 'Bearing SKF-6205', x: 400, y: 70 },
    { match: /\bl[-\s]?19920\b|\blot\b/i, id: 'lot-l19920', label: 'Lot L-19920', x: 400, y: 180 },
    { match: /\bline\s*3\b|\bmunich line\b/i, id: 'line-3', label: 'Munich Line 3', x: 720, y: 70 },
    { match: /\bplant\b|\bmunich\b/i, id: 'plant-munich', label: 'Plant Munich', x: 880, y: 70 },
    { match: /\bwo[-\s]?8841\b|\bwork order\b/i, id: 'wo-8841', label: 'WO-8841', x: 720, y: 180 },
    { match: /\bmeridian\b|\bsupplier\b/i, id: 'meridian', label: 'Meridian GmbH', x: 880, y: 290 },
  ];
  var ROLES = [
    { match: /\bquality\b/i, id: 'role-qe', label: 'Role · Quality engineer', x: 80, y: 400 },
    { match: /\bauditor\b|\baudit\b/i, id: 'role-auditor', label: 'Role · Auditor', x: 400, y: 400 },
    { match: /\boperator\b|\bshift\b/i, id: 'role-op', label: 'Role · Operator', x: 240, y: 400 },
    { match: /\bplant manager\b/i, id: 'role-pm', label: 'Role · Plant manager', x: 560, y: 400 },
  ];
  var ACTIONS = [
    { match: /\bstop( the)? line\b|\bhalt\b/i, action: 'stop_line', predicate: 'halts' },
    { match: /\bopen( a)? work order\b|\bopen wo\b/i, action: 'open_work_order', predicate: 'opens' },
    { match: /\bquarantine\b/i, action: 'quarantine_lot', predicate: 'quarantines' },
    { match: /\brequire(s)? (a )?second source\b|\bcorroborat/i, action: 'require_second_source', predicate: 'requires_second_source' },
    { match: /\bsign[- ]off\b|\bquality sign/i, action: 'require_quality_signoff', predicate: 'requires_signoff' },
    { match: /\bcannot ship\b|\bdo not ship\b|\bblock ship/i, action: 'block_ship', predicate: 'blocks_ship' },
  ];

  function parse(text) {
    var entities = ENTITY.filter(function (item) { return item.match.test(text); });
    var roles = ROLES.filter(function (item) { return item.match.test(text); });
    var actions = ACTIONS.filter(function (item) { return item.match.test(text); });
    var th = text.match(/(exceeds|above|greater than|>=|>|at least|over)\s+(\d+(?:\.\d+)?)/i)
      || text.match(/(\d+(?:\.\d+)?)\s*(mm\/s|mm s|percent|%|hours?)/i);
    var threshold = null;
    if (th) {
      var value = Number(th[2] || th[1]);
      if (!isNaN(value)) {
        threshold = {
          metric: /vib|mm/i.test(text) ? 'amplitudeMmS' : 'value',
          operator: '>=',
          value: value,
        };
      }
    }
    var ready = text.trim().length >= 6 || entities.length || roles.length || actions.length || threshold;
    return { entities: entities, roles: roles, actions: actions, threshold: threshold, ready: ready, text: text.trim() };
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attrs).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    return el;
  }

  function boot() {
    var ta = document.getElementById('human-rule');
    var svg = document.querySelector('svg[aria-label="Knowledge graph"]');
    if (!ta || !svg || ta.dataset.rtBound) return;
    ta.dataset.rtBound = '1';
    var tokens = document.querySelector('[aria-live="polite"]');
    var addBtn = document.querySelector('button.demo_addRule__nliUr, button[class*="addRule"]');
    var summary = addBtn && addBtn.parentNode ? addBtn.parentNode.querySelector('p') : null;
    var stats = document.querySelectorAll('.demo_stats__jV1n0 dd, [class*="stats"] dd');
    var committed = [];
    var layer = svgEl('g', { id: 'rt-draft' });
    svg.appendChild(layer);

    function render(text, persist) {
      var parsed = parse(text);
      layer.innerHTML = '';
      if (tokens) {
        tokens.innerHTML = '';
        parsed.entities.forEach(function (item) {
          var span = document.createElement('span');
          span.className = 'demo_tokenEntity__x8K2p';
          span.style.cssText = 'border-radius:999px;padding:0.22rem 0.6rem;font-size:0.75rem;font-weight:700;background:#eee8ff;color:#5025d1';
          span.textContent = item.label;
          tokens.appendChild(span);
        });
        parsed.roles.forEach(function (item) {
          var span = document.createElement('span');
          span.style.cssText = 'border-radius:999px;padding:0.22rem 0.6rem;font-size:0.75rem;font-weight:700;background:#e8f7f3;color:#0a6b58;margin-left:4px';
          span.textContent = item.label.replace('Role · ', '');
          tokens.appendChild(span);
        });
        parsed.actions.forEach(function (item) {
          var span = document.createElement('span');
          span.style.cssText = 'border-radius:999px;padding:0.22rem 0.6rem;font-size:0.75rem;font-weight:700;background:#ffe8ee;color:#b0103a;margin-left:4px';
          span.textContent = item.action;
          tokens.appendChild(span);
        });
        if (parsed.threshold) {
          var span = document.createElement('span');
          span.style.cssText = 'border-radius:999px;padding:0.22rem 0.6rem;font-size:0.75rem;font-weight:700;background:#fff4d6;color:#8a5a00;margin-left:4px';
          span.textContent = parsed.threshold.metric + ' >= ' + parsed.threshold.value;
          tokens.appendChild(span);
        }
        if (!parsed.ready) {
          var hint = document.createElement('span');
          hint.textContent = 'Tokens appear as the sentence is recognized.';
          hint.style.color = '#5c5f6b';
          tokens.appendChild(hint);
        }
      }
      if (addBtn) addBtn.disabled = !parsed.ready;
      if (summary) {
        summary.textContent = parsed.ready
          ? ((parsed.roles[0] ? 'Role: ' + parsed.roles[0].label : 'Role: quality engineer (default)')
            + (parsed.entities.length ? ' · Binds: ' + parsed.entities.map(function (item) { return item.label; }).join(', ') : ' · New policy node')
            + (parsed.actions.length ? ' · Action: ' + parsed.actions.map(function (item) { return item.action; }).join(', ') : '')
            + (parsed.threshold ? ' · Threshold: ' + parsed.threshold.metric + ' >= ' + parsed.threshold.value : ''))
          : 'Keep typing. A live draft node starts on the first recognized phrase.';
      }
      if (!parsed.ready) return parsed;

      var ruleX = 80 + ((committed.length + (persist ? 0 : 0)) % 5) * 180;
      var ruleY = persist ? 470 : 470;
      var dash = persist ? undefined : '6 4';
      var rule = svgEl('circle', {
        cx: String(ruleX),
        cy: String(ruleY),
        r: '14',
        fill: '#e11d48',
        stroke: '#5025d1',
        'stroke-width': '3',
        'stroke-dasharray': persist ? '' : '4 3',
      });
      var ruleLabel = svgEl('text', {
        x: String(ruleX),
        y: String(ruleY + 28),
        'text-anchor': 'middle',
        'font-size': '11',
        'font-weight': '700',
        'font-family': 'Arial, Helvetica, sans-serif',
        fill: '#16171a',
      });
      ruleLabel.textContent = parsed.text.length > 28 ? parsed.text.slice(0, 26) + '…' : parsed.text;
      layer.appendChild(rule);
      layer.appendChild(ruleLabel);

      parsed.entities.concat(parsed.roles).forEach(function (item) {
        var line = svgEl('line', {
          x1: String(ruleX),
          y1: String(ruleY),
          x2: String(item.x),
          y2: String(item.y),
          stroke: '#5025d1',
          'stroke-width': '2.4',
          'stroke-dasharray': persist ? '' : '6 4',
        });
        var pred = svgEl('text', {
          x: String((ruleX + item.x) / 2),
          y: String((ruleY + item.y) / 2 - 6),
          'font-size': '9',
          fill: '#6b6d76',
        });
        pred.textContent = parsed.actions[0] ? parsed.actions[0].predicate : 'mentions';
        layer.appendChild(line);
        layer.appendChild(pred);
      });

      if (parsed.threshold) {
        var thX = Math.min(880, ruleX + 180);
        layer.appendChild(svgEl('circle', {
          cx: String(thX),
          cy: String(ruleY),
          r: '12',
          fill: '#e11d48',
          stroke: '#5025d1',
          'stroke-width': '3',
          'stroke-dasharray': persist ? '' : '4 3',
        }));
        var thText = svgEl('text', {
          x: String(thX),
          y: String(ruleY + 28),
          'text-anchor': 'middle',
          'font-size': '11',
          'font-weight': '700',
          fill: '#16171a',
        });
        thText.textContent = parsed.threshold.metric + ' >= ' + parsed.threshold.value;
        layer.appendChild(thText);
      }

      if (stats && stats.length >= 4) {
        var extraNodes = 1 + (parsed.threshold ? 1 : 0);
        var extraEdges = parsed.entities.length + parsed.roles.length + (parsed.threshold ? 1 : 0);
        stats[0].textContent = String(21 + committed.length + extraNodes);
        stats[1].textContent = String(26 + committed.length + extraEdges);
        stats[3].textContent = String(6 + committed.length + extraNodes);
      }
      return parsed;
    }

    ta.addEventListener('input', function () { render(ta.value, false); });
    document.querySelectorAll('[class*="examples"] button').forEach(function (button) {
      button.addEventListener('click', function () {
        ta.value = button.textContent || '';
        render(ta.value, false);
      });
    });
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var parsed = render(ta.value, true);
        if (!parsed || !parsed.ready) return;
        committed.push(parsed);
        var list = document.querySelector('[class*="ruleList"]');
        if (!list) {
          list = document.createElement('ol');
          list.className = 'demo_ruleList';
          addBtn.parentNode.parentNode.appendChild(list);
        }
        var li = document.createElement('li');
        li.innerHTML = '<strong>R' + committed.length + '.</strong> ' + parsed.text;
        list.appendChild(li);
        var keep = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        keep.innerHTML = layer.innerHTML;
        svg.appendChild(keep);
        ta.value = '';
        render('', false);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 400); });
  } else {
    setTimeout(boot, 400);
  }
})();
