import jwt from 'jsonwebtoken';

/* By default, API Gateway authorizations are cached (TTL) for 300 seconds.
This policy will authorize all requests to the same API Gateway instance where the
request is coming from, thus being efficient and optimising costs */

const generatePolicy = (principalId, methodArn) => {
	const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

	return {
		principalId,
		policyDocument: {
			Version: '2012-10-17',
			Statement: [
				{
					Action: 'execute-api:Invoke',
					Effect: 'Allow',
					Resource: apiGatewayWildcard,
				},
			],
		},
	};
};

export const handler = async (event, context) => {
	const { authorizationToken, methodArn } = event;

	if (!authorizationToken) {
		throw 'Unauthorized';
	}

	const token = authorizationToken.replace('Bearer ', '');

	try {
		const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
		//generatePolicy by generatePolicy fn
		const policy = generatePolicy(claims.sub, methodArn);

		return {
			...policy,
			context: claims,
		};
	} catch (error) {
		console.log(error);
		throw 'Unauthorized';
	}
};
