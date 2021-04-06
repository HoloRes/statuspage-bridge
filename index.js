addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {
	const body = await request.json();
	const { searchParams } = new URL(request.url);
	if(searchParams.get('token') !== TOKEN) return new Response('Unauthorized', { status: 403, statusText: 'Unauthorized' });

	if(body.incident) {
		let color = 16711680;
		if (body.incident.status === 'monitoring') color = 16746496;
		if (body.incident.status === 'resolved') color = 65280;

		const discordRequest = new Request(WEBHOOKURL, {
			body: JSON.stringify({
				avatar_url: 'https://holores.s3.nl-ams.scw.cloud/statuspage_icon.jpg',
				username: 'Statuspage',
				embeds: [{
					title: body.incident.name,
					description: body.incident.incident_updates[0].body,
					url: body.incident.shortlink,
					color,
					fields: [
						{
							name: 'Status',
							value: body.incident.status,
							inline: true,
						},
						{
							name: 'Impact',
							value: body.incident.impact,
							inline: true,
						},
					],
					timestamp: body.incident.updated_at,
				}],
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		fetch(discordRequest);
	} else if(body.component_update) {
		let color = 16711680;
		if (body.incident.status === 'degraded_performance') color = 16746496;
		if (body.incident.status === 'operational') color = 65280;

		let oldStatus, newStatus;
		const {old_status: reqOldStatus, new_status: reqNewStatus } = body.component_update;

		if(reqOldStatus === 'major_outage') oldStatus = 'Major outage';
		else if(reqOldStatus === 'partial_outage') oldStatus = 'Partial outage';
		else if(reqOldStatus === 'degraded_performance') oldStatus = 'Degraded performance';
		else if(reqOldStatus === 'operational') oldStatus = 'Operational';

		if(reqNewStatus === 'major_outage') newStatus = 'Major outage';
		else if(reqNewStatus === 'partial_outage') newStatus = 'Partial outage';
		else if(reqNewStatus === 'degraded_performance') newStatus = 'Degraded performance';
		else if(reqNewStatus === 'operational') newStatus = 'Operational';

		const discordRequest = new Request(WEBHOOKURL, {
			body: {
				avatar_url: 'https://holores.s3.nl-ams.scw.cloud/statuspage_icon.jpg',
				username: 'Statuspage',
				embeds: [{
					title: body.component.name,
					description: `${oldStatus} -> ${newStatus}`,
					url: 'https://status.hlresort.community',
					color,
					timestamp: body.component_update.created_at,
				}],
			},
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		fetch(discordRequest);
	}
	return new Response('200 OK', { status: 200, statusText: 'OK' });
}
